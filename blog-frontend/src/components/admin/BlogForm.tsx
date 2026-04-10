'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, Upload, X, Tag, ArrowLeft } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import api from '@/lib/api';
import { Blog, Author } from '@/types';
import { getImageUrl } from '@/lib/utils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Post' : 'New Post'}</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setForm({ ...form, status: 'draft' }); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              form.status === 'draft'
                ? 'border-yellow-600 bg-yellow-900/30 text-yellow-400'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            Save as draft
          </button>
          <button
            type="submit"
            onClick={() => setForm((f) => ({ ...f, status: 'published' }))}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {form.status === 'published' ? 'Publish' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            {field('Title', 'title', 'Enter a compelling title...', true)}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="A short summary of your post..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-medium text-sm">
                Content <span className="text-red-400">*</span>
              </h3>
              {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content}</p>}
            </div>
            <div className="bg-white">
              <RichTextEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Cover image */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-medium text-sm mb-3">Cover Image</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
                coverPreview ? 'border-green-600' : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              {coverPreview ? (
                <div className="relative h-40">
                  <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCoverPreview(null); setCoverFile(null); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-gray-500">
                  <Upload className="w-6 h-6 mb-2" />
                  <p className="text-xs">Click to upload cover</p>
                  <p className="text-xs">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          {/* Meta */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-medium text-sm">Post Details</h3>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">
                Author <span className="text-red-400">*</span>
              </label>
              <select
                value={form.author_id}
                onChange={(e) => setForm({ ...form, author_id: e.target.value })}
                className={`w-full bg-gray-800 border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.author_id ? 'border-red-500' : 'border-gray-700'
                }`}
              >
                <option value="">Select author</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {errors.author_id && <p className="text-red-400 text-xs mt-1">{errors.author_id}</p>}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Web Development"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">
                <Tag className="w-3.5 h-3.5 inline mr-1" /> Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-500 transition-colors"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-900/50 border border-green-700 text-green-300 text-xs rounded-full"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
