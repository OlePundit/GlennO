'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, Upload, X, Tag, ArrowLeft } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import api from '@/lib/api';
import { Blog, Author } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { CustomImage } from '@/components/RichTextEditor/CustomImage';
import ImageUploadModal from '@/components/RichTextEditor/ImageUploadModal';

interface BlogFormProps {
  blog?: Blog;
  isEdit?: boolean;
}

export default function BlogForm({ blog, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState({
    title: blog?.title || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    category: blog?.category || '',
    status: blog?.status || 'draft',
    author_id: blog?.author_id ? String(blog.author_id) : '',
  });
  const [tags, setTags] = useState<string[]>(blog?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(
    getImageUrl(blog?.cover_image ?? null)
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [, forceRender] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    api.get('/admin/authors').then((res) => {
      setAuthors(res.data);
      if (!form.author_id && res.data.length > 0) {
        setForm((f) => ({ ...f, author_id: String(res.data[0].id) }));
      }
    });
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.content.trim() || form.content === '<p></p>') errs.content = 'Content is required';
    if (!form.author_id) errs.author_id = 'Please select an author';
    return errs;
  };
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      CustomImage,
    ],
    content: blog?.content || '',
    editorProps: {
      attributes: {
        class: 'min-h-[300px] px-3 py-2.5 text-sm text-gray-100 focus:outline-none prose max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm((f) => ({ ...f, content: html }));
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    onSelectionUpdate: () => forceRender(n => n + 1),
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      tags.forEach((tag) => fd.append('tags[]', tag));
      if (coverFile) fd.append('cover_image', coverFile);

      if (isEdit && blog) {
        await api.post(`/admin/blogs/${blog.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/admin/blogs', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      router.push('/admin/blogs');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (axiosErr.response?.data?.errors) {
        const be: Record<string, string> = {};
        Object.entries(axiosErr.response.data.errors).forEach(([k, v]) => {
          be[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(be);
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof typeof form, placeholder: string, required = false) => (
    <div>
      <label className="block text-gray-300 text-sm font-medium mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
          errors[key] ? 'border-red-500' : 'border-gray-700'
        }`}
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {pendingImageFile && editor && (
        <ImageUploadModal
          file={pendingImageFile}
          editor={editor}
          onClose={() => setPendingImageFile(null)}
          onError={setError}
        />
      )}

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-900 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-800">
        {field('Title', 'title', 'Enter blog title', true)}

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Short summary shown on blog cards"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field('Category', 'category', 'e.g. Tech, Tutorials')}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">
              Author <span className="text-red-400">*</span>
            </label>
            <select
              value={form.author_id}
              onChange={(e) => setForm({ ...form, author_id: e.target.value })}
              className={`w-full bg-gray-800 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.author_id ? 'border-red-500' : 'border-gray-700'
              }`}
            >
              <option value="">Select an author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
            </select>
            {errors.author_id && <p className="text-red-400 text-xs mt-1">{errors.author_id}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addTag(); }
              }}
              placeholder="Add a tag and press Enter"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Tag className="w-4 h-4" />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-xs font-medium"
                >
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Cover image</label>
          {coverPreview && (
            <div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden border border-gray-700">
              <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => { setCoverPreview(null); setCoverFile(null); }}
                className="absolute top-2 right-2 p-1.5 bg-gray-950/80 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <label className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-400 hover:bg-gray-750 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            {coverFile ? coverFile.name : 'Choose an image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleCoverChange}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">
            Body <span className="text-red-400">*</span>
          </label>
          <div className="border border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-green-500">
            <div className="flex flex-wrap gap-1 border-b border-gray-700 bg-gray-800 px-2 py-1.5 sticky top-0 z-10 rounded-t-xl">
              <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold">
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic">
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline">
                <span className="underline">U</span>
              </ToolbarButton>
              <div className="w-px bg-gray-700 mx-1" />
              <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Heading 2">
                H2
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="Heading 3">
                H3
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} active={editor?.isActive('heading', { level: 4 })} title="Heading 4">
                H4
              </ToolbarButton>
              <div className="w-px bg-gray-700 mx-1" />
              <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">
                &#8226; List
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Ordered list">
                1. List
              </ToolbarButton>
              <div className="w-px bg-gray-700 mx-1" />
              <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Blockquote">
                &ldquo;&rdquo;
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline code">
                &lt;/&gt;
              </ToolbarButton>
              <div className="w-px bg-gray-700 mx-1" />
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt('Enter URL');
                  if (url) editor?.chain().focus().setLink({ href: url }).run();
                  else editor?.chain().focus().unsetLink().run();
                }}
                active={editor?.isActive('link')}
                title="Link"
              >
                Link
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} title="Undo">
                ↩
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} title="Redo">
                ↪
              </ToolbarButton>
              <div className="w-px bg-gray-700 mx-1" />
              <ToolbarButton
                onClick={() => imageInputRef.current?.click()}
                title="Insert image"
                active={false}
              >
                Img
              </ToolbarButton>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) setPendingImageFile(file);
                }}
              />
            </div>
            <EditorContent editor={editor} />
            <div className="px-3 py-1.5 border-t border-gray-700 bg-gray-800 text-xs text-gray-500 text-right rounded-b-xl">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </div>
          </div>
          {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish post'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-400 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
        active ? 'bg-green-900/50 text-green-400' : 'text-gray-400 hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
