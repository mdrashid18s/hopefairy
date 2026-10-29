'use client';

import { useEffect, useState, useRef } from 'react';
import {
  getAdminServices,
  createAdminService,
  updateAdminService,
  toggleAdminService,
  deleteAdminService,
  uploadAdminServiceImage,
} from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';

const ICON_PRESETS = [
  { name: 'compass', label: 'Compass' },
  { name: 'graduation-cap', label: 'Graduation Cap' },
  { name: 'file-text', label: 'File & SOP' },
  { name: 'award', label: 'Award & Test' },
  { name: 'badge-percent', label: 'Scholarship' },
  { name: 'shield-check', label: 'Visa Shield' },
  { name: 'plane-takeoff', label: 'Pre-Departure' },
  { name: 'home', label: 'Accommodation' },
  { name: 'wallet', label: 'Financial Aid' },
  { name: 'globe', label: 'Global' },
  { name: 'users', label: 'Counselling' },
  { name: 'book-open', label: 'Academics' },
];

export default function AdminServicesPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [togglingServiceId, setTogglingServiceId] = useState(null);

  // Image tab mode: 'file' or 'url'
  const [imageTab, setImageTab] = useState('file');
  const fileInputRef = useRef(null);

  const initialForm = {
    title: '',
    slug: '',
    headline: '',
    short: '',
    icon: 'compass',
    image: '',            // URL or existing relative path
    imageFile: null,      // File object when picked from disk
    imagePreview: null,   // ObjectURL or remote URL for live preview
    features: '',
    highlights: '',
    is_active: true,
    display_order: 1,
  };
  const [form, setForm] = useState(initialForm);

  const fetchServices = async () => {
    try {
      const data = await getAdminServices();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setServices(list);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setErrorMessage('');
    setImageTab('file');
    setForm({
      ...initialForm,
      display_order: services.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setErrorMessage('');
    const existingImage = item.image_url || item.image || '';
    setImageTab(existingImage.startsWith('http') && !existingImage.includes('/storage/services') ? 'url' : 'file');
    setForm({
      title: item.title || '',
      slug: item.slug || '',
      headline: item.headline || '',
      short: item.short || '',
      icon: item.icon || 'compass',
      image: existingImage,
      imageFile: null,
      imagePreview: existingImage,
      features: Array.isArray(item.features) ? item.features.join('\n') : '',
      highlights: item.highlights || [],
      is_active: Boolean(item.is_active),
      display_order: item.display_order || 1,
    });
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Selected file is too large. Maximum size is 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: previewUrl,
    }));
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({
      ...prev,
      image: '',
      imageFile: null,
      imagePreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMessage('');

    try {
      if (form.imageFile) {
        // Send multipart/form-data for file upload
        const formData = new FormData();
        formData.append('title', form.title);
        if (form.slug) formData.append('slug', form.slug);
        formData.append('headline', form.headline);
        formData.append('short', form.short);
        formData.append('icon', form.icon || 'compass');
        formData.append('image', form.imageFile);
        formData.append('features', form.features);
        if (form.highlights) {
          const hlVal = typeof form.highlights === 'string' ? form.highlights : JSON.stringify(form.highlights);
          formData.append('highlights', hlVal);
        }
        formData.append('is_active', form.is_active ? '1' : '0');
        formData.append('display_order', String(form.display_order || 1));

        if (editingItem) {
          await updateAdminService(editingItem.id, formData);
        } else {
          await createAdminService(formData);
        }
      } else {
        // Send JSON payload
        const payload = {
          title: form.title,
          slug: form.slug,
          headline: form.headline,
          short: form.short,
          icon: form.icon || 'compass',
          image: form.image || '', // Empty string signals removal if previously set
          features: form.features,
          highlights: form.highlights,
          is_active: form.is_active,
          display_order: form.display_order,
        };

        if (editingItem) {
          await updateAdminService(editingItem.id, payload);
        } else {
          await createAdminService(payload);
        }
      }

      setModalOpen(false);
      await fetchServices();
    } catch (err) {
      console.error('Failed to save service:', err);
      setErrorMessage(err.message || 'An error occurred while saving the service.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (item) => {
    if (togglingServiceId === item.id) return;
    setTogglingServiceId(item.id);

    const prevStatus = Boolean(item.is_active);
    const nextStatus = !prevStatus;
    setServices((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, is_active: nextStatus } : s))
    );

    try {
      const res = await toggleAdminService(item.id);
      if (res && res.is_active !== undefined) {
        setServices((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, is_active: Boolean(res.is_active) } : s))
        );
      }
    } catch (err) {
      setServices((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: prevStatus } : s))
      );
      alert('Failed to toggle status: ' + err.message);
    } finally {
      setTogglingServiceId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service? All associated media will also be removed.')) return;
    try {
      await deleteAdminService(id);
      await fetchServices();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Services & Offerings</h1>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Manage counseling services, test preparation, SOP editing, cover photos, and visa guidance modules.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-amber-400/20 transition self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((item) => {
          const photoUrl = item.image_url || item.image;
          return (
            <div
              key={item.id}
              className={`group rounded-2xl border flex flex-col justify-between transition shadow-lg overflow-hidden ${
                isLight
                  ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-slate-100'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Photo Banner or Visual Header */}
                {photoUrl ? (
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden border-b border-slate-800/80">
                    <img
                      src={photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase bg-slate-900/90 backdrop-blur-md text-amber-400 px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-sm flex items-center gap-1.5 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {item.icon}
                      </span>
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={togglingServiceId === item.id}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md transition cursor-pointer shadow-sm inline-flex items-center gap-1.5 ${
                          item.is_active
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                        } ${togglingServiceId === item.id ? 'opacity-75 cursor-wait' : ''}`}
                      >
                        {togglingServiceId === item.id ? (
                          <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        ) : null}
                        <span>{togglingServiceId === item.id ? 'Updating...' : item.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>

                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Cover Photo Attached
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold ${
                        isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {item.icon}
                      </span>
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={togglingServiceId === item.id}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition cursor-pointer inline-flex items-center gap-1.5 ${
                          item.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        } ${togglingServiceId === item.id ? 'opacity-75 cursor-wait' : ''}`}
                      >
                        {togglingServiceId === item.id ? (
                          <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        ) : null}
                        <span>{togglingServiceId === item.id ? 'Updating...' : item.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>

                    {/* No photo prompt banner */}
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="w-full mb-3 py-3 px-3 rounded-xl border border-dashed border-slate-800 hover:border-amber-400/40 bg-slate-950/40 hover:bg-slate-950 text-slate-500 hover:text-amber-400 text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Cover Photo</span>
                    </button>
                  </div>
                )}

                <div className={`p-6 ${photoUrl ? 'pt-4' : 'pt-2'}`}>
                  <h3
                    className="text-base font-bold mb-1 tracking-tight"
                    style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-xs font-medium mb-3"
                    style={{ color: isLight ? '#946c1a' : '#d8b056' }}
                  >
                    {item.headline}
                  </p>
                  <p
                    className="text-xs line-clamp-2 leading-relaxed"
                    style={{ color: isLight ? '#475569' : '#9e988b' }}
                  >
                    {item.short}
                  </p>
                </div>
              </div>

              <div className={`p-6 pt-4 border-t flex items-center justify-between ${
                isLight ? 'border-slate-100 bg-slate-50/60' : 'border-slate-800/80 bg-slate-900/50'
              }`}>
                <span className="text-xs font-semibold text-slate-500">Order #{item.display_order}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#100f0e] border border-[#24221e] text-[#faf7f0] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-[#d8b056]/10 text-[#d8b056] border border-[#d8b056]/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {editingItem ? `Edit Service: ${editingItem.title}` : 'Add New Service Offering'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure presentation details, cover photo, and offerings specs.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 mt-6">
              {/* Photo / Cover Image Section */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    Service Cover Photo
                  </label>
                  <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageTab('file')}
                      className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                        imageTab === 'file'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                        imageTab === 'url'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Live Image Preview if available */}
                {form.imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group/prev">
                    <div className="relative h-44 w-full">
                      <img
                        src={form.imagePreview}
                        alt="Service Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-3 text-xs font-semibold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {form.imageFile ? `New File: ${form.imageFile.name}` : 'Cover Photo Active'}
                      </div>
                    </div>
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                      {imageTab === 'file' && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 backdrop-blur-md transition cursor-pointer"
                        >
                          Change
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-medium backdrop-blur-md transition cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {imageTab === 'file' ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-800 hover:border-amber-400/50 rounded-xl p-6 text-center cursor-pointer transition bg-slate-900/40 hover:bg-slate-900/80 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-slate-200">
                          Click to select a service photo or drag and drop
                        </p>
                        <p className="text-[11px] text-slate-500">
                          PNG, JPG, WEBP, or SVG (Up to 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={form.image}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              image: val,
                              imagePreview: val,
                              imageFile: null,
                            }));
                          }}
                          placeholder="https://images.unsplash.com/... or public photo URL"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <p className="text-[11px] text-slate-500">
                          Provide any direct CDN or remote image link.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/avif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. University Admissions"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. university-admissions"
                  />
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Headline Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="e.g. The Right University, Not Just Any University"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Short Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.short}
                  onChange={(e) => setForm({ ...form, short: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="A balanced university shortlist and expertly managed applications..."
                />
              </div>

              {/* Icon & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Icon Identifier
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    list="icon-presets"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="compass, graduation-cap, etc."
                  />
                  <datalist id="icon-presets">
                    {ICON_PRESETS.map((ic) => (
                      <option key={ic.name} value={ic.name}>
                        {ic.label}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Features List */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Features & Highlights (One item per line)
                </label>
                <textarea
                  rows={3}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="One-to-one career discovery session&#10;Academic profile evaluation&#10;Scholarship and bursary strategy"
                />
              </div>

              {/* Action Buttons & Visibility Checkbox */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-amber-400 rounded bg-slate-950 border-slate-800 focus:ring-amber-400 cursor-pointer"
                  />
                  <span>Show on Public Website</span>
                </label>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-[#080809] shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-102"
                    style={{
                      background: 'linear-gradient(135deg, #e4c775 0%, #d8b056 45%, #c89b3c 100%)',
                      boxShadow: '0 4px 14px -2px rgba(200, 155, 60, 0.4)',
                    }}
                  >
                    {actionLoading && (
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>{actionLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Service'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
