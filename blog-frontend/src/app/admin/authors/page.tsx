'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import api from '@/lib/api';
import { Author } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface AuthorFormData {
  name: string;
  email: string;
  bio: string;
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
  location: string;
}

const EMPTY_FORM: AuthorFormData = {
  name: '', email: '', bio: '', website: '',
  twitter: '', github: '', linkedin: '', location: '',
};

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAuthor, setEditAuthor] = useState<Author | null>(null);
  const [form, setForm] = useState<AuthorFormData>(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchAuthors = async () => {
    setLoading(true);
    const res = await api.get('/admin/authors');
    setAuthors(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchAuthors(); }, []);

  const openCreate = () => {
    setEditAuthor(null);
    setForm(EMPTY_FORM);
    setAvatarFile(null);
    setAvatarPreview(null);
    setShowModal(true);
  };

  const openEdit = (author: Author) => {
    setEditAuthor(author);
    setForm({
      name: author.name,
      email: author.email,
      bio: author.bio || '',
      website: author.website || '',
      twitter: author.twitter || '',
      github: author.github || '',
      linkedin: author.linkedin || '',
      location: author.location || '',
    });
    setAvatarPreview(getImageUrl(author.avatar));
    setAvatarFile(null);
    setShowModal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (avatarFile) fd.append('avatar', avatarFile);

      if (editAuthor) {
        await api.post(`/admin/authors/${editAuthor.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/admin/authors', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowModal(false);
      fetchAuthors();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (author: Author) => {
    if (!confirm(`Delete "${author.name}"? Their blog posts will also be deleted.`)) return;
    setDeleting(author.id);
    try {
      await api.delete(`/admin/authors/${author.id}`);
      fetchAuthors();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Authors</h1>
          <p className="text-gray-400 mt-1">{authors.length} author{authors.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Author
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : authors.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="mb-3">No authors yet.</p>
          <button onClick={openCreate} className="text-green-400 hover:underline text-sm">
            Add your first author →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map((author) => (
            <div key={author.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-800 flex-shrink-0 overflow-hidden flex items-center justify-center text-lg font-bold text-white">
                    {getImageUrl(author.avatar) ? (
                      <Image
                        src={getImageUrl(author.avatar)!}
                        alt={author.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      author.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{author.name}</h3>
                    <p className="text-gray-500 text-xs">{author.email}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(author)}
                    className="p-1.5 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(author)}
                    disabled={deleting === author.id}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {deleting === author.id ? (
                      <span className="w-4 h-4 border border-gray-600 border-t-red-400 rounded-full animate-spin block" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {author.bio && (
                <p className="text-gray-400 text-sm mt-3 line-clamp-2">{author.bio}</p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <span>{author.blogs_count ?? 0} blog{(author.blogs_count ?? 0) !== 1 ? 's' : ''}</span>
                <span className={`flex items-center gap-1 ${author.is_active ? 'text-green-400' : 'text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${author.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                  {author.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-white font-semibold">{editAuthor ? 'Edit Author' : 'New Author'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-500 flex-shrink-0">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar" width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    form.name.charAt(0) || '?'
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-green-400 hover:text-green-300 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload avatar
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Name *', key: 'name', placeholder: 'Full name' },
                  { label: 'Email *', key: 'email', placeholder: 'email@example.com' },
                  { label: 'Location', key: 'location', placeholder: 'City, Country' },
                  { label: 'Website', key: 'website', placeholder: 'https://...' },
                  { label: 'Twitter', key: 'twitter', placeholder: 'username' },
                  { label: 'GitHub', key: 'github', placeholder: 'username' },
                  { label: 'LinkedIn', key: 'linkedin', placeholder: 'profile-slug' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="col-span-2 sm:col-span-1">
                    <label className="block text-gray-400 text-xs font-medium mb-1">{label}</label>
                    <input
                      type="text"
                      value={form[key as keyof AuthorFormData]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      required={key === 'name' || key === 'email'}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs font-medium mb-1">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="A brief bio..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editAuthor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
