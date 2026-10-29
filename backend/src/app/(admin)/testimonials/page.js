'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  getAdminTestimonials,
  createAdminTestimonial,
  updateAdminTestimonial,
  toggleAdminTestimonial,
  deleteAdminTestimonial,
  uploadAdminTestimonialAvatar,
} from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';

export default function AdminTestimonialsPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  // Data states
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Row mutation tracking (optimistic toggle without full-page reloads)
  const [togglingId, setTogglingId] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Avatar / DP File Upload States
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarDragOver, setAvatarDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);
  const isDroppingRef = useRef(false);

  const initialForm = {
    client_name: '',
    client_role: '',
    avatar: '',
    rating: 5,
    review: '',
    destination_country: '',
    course_program: '',
    is_featured: false,
    is_active: true,
    display_order: 1,
  };
  const [form, setForm] = useState(initialForm);

  // Fetch initial data
  const fetchData = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      setError('');
      const data = await getAdminTestimonials();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setTestimonials(list);
    } catch (err) {
      setError(err.message || 'Failed to load testimonials.');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // ---------------- Stats Calculation ----------------
  const stats = useMemo(() => {
    const total = testimonials.length;
    const active = testimonials.filter((t) => t.is_active).length;
    const featured = testimonials.filter((t) => t.is_featured).length;
    const fiveStars = testimonials.filter((t) => t.rating === 5).length;
    return { total, active, featured, fiveStars };
  }, [testimonials]);

  // ---------------- Filtered Testimonials ----------------
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      if (ratingFilter !== 'all' && Number(t.rating) !== Number(ratingFilter)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = t.client_name?.toLowerCase().includes(q);
        const matchesRole = t.client_role?.toLowerCase().includes(q);
        const matchesReview = t.review?.toLowerCase().includes(q);
        const matchesCountry = t.destination_country?.toLowerCase().includes(q);
        const matchesCourse = t.course_program?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesReview && !matchesCountry && !matchesCourse) {
          return false;
        }
      }
      return true;
    });
  }, [testimonials, ratingFilter, searchQuery]);

  // ---------------- Handlers ----------------
  const openAddModal = () => {
    setEditingItem(null);
    setShowUrlInput(false);
    setForm({
      ...initialForm,
      display_order: testimonials.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setShowUrlInput(false);
    setForm({
      client_name: item.client_name || '',
      client_role: item.client_role || '',
      avatar: item.avatar || '',
      rating: item.rating ?? 5,
      review: item.review || '',
      destination_country: item.destination_country || '',
      course_program: item.course_program || '',
      is_featured: Boolean(item.is_featured),
      is_active: Boolean(item.is_active),
      display_order: item.display_order ?? 1,
    });
    setModalOpen(true);
  };

  const handleAvatarFile = async (file) => {
    if (!file) return;
    if (avatarUploading) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await uploadAdminTestimonialAvatar(file);
      const uploadedUrl = res?.url || res?.path;
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, avatar: uploadedUrl }));
      }
    } catch (err) {
      alert('Failed to upload DP: ' + (err.message || 'Server error'));
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAvatarDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAvatarDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAvatarDragOver(false);

    // Suppress click event caused by releasing mouse on drop
    isDroppingRef.current = true;
    setTimeout(() => {
      isDroppingRef.current = false;
    }, 400);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleAvatarFile(files[0]);
    } else {
      // Support drag & drop of image URLs directly from other browser tabs / web pages
      const draggedUrl = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain');
      if (draggedUrl && (draggedUrl.startsWith('http://') || draggedUrl.startsWith('https://') || draggedUrl.startsWith('data:image/'))) {
        setForm((prev) => ({ ...prev, avatar: draggedUrl }));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.client_name.trim()) {
      alert('Please enter client or student name.');
      return;
    }
    if (!form.review.trim()) {
      alert('Please enter testimonial review content.');
      return;
    }

    setActionLoading(true);
    try {
      if (editingItem) {
        await updateAdminTestimonial(editingItem.id, form);
      } else {
        await createAdminTestimonial(form);
      }
      setModalOpen(false);
      await fetchData(false);
    } catch (err) {
      alert('Failed to save testimonial: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (item) => {
    if (togglingId === item.id) return;
    setTogglingId(item.id);

    // Optimistic toggle: immediately flip in local state
    const prevStatus = Boolean(item.is_active);
    const nextStatus = !prevStatus;

    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, is_active: nextStatus } : t))
    );

    try {
      await toggleAdminTestimonial(item.id);
    } catch (err) {
      // Revert on failure
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, is_active: prevStatus } : t))
      );
      alert('Toggle failed: ' + (err.message || 'Server error'));
    } finally {
      setTogglingId(null);
    }
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      await deleteAdminTestimonial(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      await fetchData(false);
    } catch (err) {
      alert('Delete failed: ' + (err.message || 'Server error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Helper styles based on dual theme
  const surfaceClass = isLight
    ? 'bg-white border-slate-200/80 shadow-[0_10px_30px_-4px_rgba(15,23,42,0.07)]'
    : 'bg-[#100f0e] border-[#24221e] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)]';

  const modalSurfaceClass = isLight
    ? 'bg-white/98 border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900'
    : 'bg-[#100f0e]/98 border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]';

  const inputClass = isLight
    ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#d8b056] focus:ring-2 focus:ring-[#d8b056]/20'
    : 'bg-[#161513] border-[#292622] text-[#faf7f0] placeholder:text-slate-600 focus:border-[#d8b056] focus:ring-2 focus:ring-[#d8b056]/25';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            <span>Website Reviews</span>
            <span>•</span>
            <span>Student & Parent Stories</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Testimonials Management
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Manage verified student feedback and admission success stories. Active reviews appear above the footer CTA card.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/15 hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${surfaceClass}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Reviews
          </div>
          <div className="text-2xl font-black text-[#d8b056] mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">In database registry</div>
        </div>
        <div className={`p-4 rounded-2xl border ${surfaceClass}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active / Live
          </div>
          <div className="text-2xl font-black text-emerald-500 mt-1">{stats.active}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Visible on public website</div>
        </div>
        <div className={`p-4 rounded-2xl border ${surfaceClass}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Featured Stories
          </div>
          <div className="text-2xl font-black text-sky-500 mt-1">{stats.featured}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Highlighted prominently</div>
        </div>
        <div className={`p-4 rounded-2xl border ${surfaceClass}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            5-Star Ratings
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.fiveStars}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Highest satisfaction</div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchData(true)} className="underline hover:no-underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className={`rounded-3xl border overflow-hidden ${surfaceClass}`}>
        {/* Filters Bar */}
        <div
          className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#24221e] bg-[#141311]'
          }`}
        >
          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, country, course, or keyword..."
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs font-medium border ${inputClass}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              Filter Rating:
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">All Ratings (1 - 5 Stars)</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-w-full">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-[#d8b056]/30 border-t-[#d8b056] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-400">Loading testimonials...</p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {testimonials.length === 0 ? 'No testimonials added yet' : 'No matching testimonials'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {testimonials.length === 0
                  ? 'Abhi database me koi testimonial nahi hai. Jab aap add karenge, wo automatically website par footer CTA ke upar dikhai denge.'
                  : 'Try resetting your search query or rating filter.'}
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#d8b056] text-[#0b0b0c] hover:brightness-105 transition cursor-pointer"
              >
                + Add First Testimonial
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr
                  className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                    isLight
                      ? 'border-slate-100 text-slate-500 bg-slate-50/50'
                      : 'border-[#24221e] text-slate-400 bg-[#12110f]'
                  }`}
                >
                  <th className="py-3.5 px-4 text-center w-14">#</th>
                  <th className="py-3.5 px-4">Student / Client</th>
                  <th className="py-3.5 px-4">Rating & Review</th>
                  <th className="py-3.5 px-4">Destination & Course</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`text-xs divide-y ${
                  isLight
                    ? 'divide-slate-100 bg-white'
                    : 'divide-[#24221e] bg-[#100f0e]'
                }`}
              >
                {filteredTestimonials.map((t) => {
                  const isRowMutating = togglingId === t.id;

                  return (
                    <tr
                      key={t.id}
                      className="transition-none"
                      style={{
                        backgroundColor: isLight ? '#ffffff' : '#100f0e',
                      }}
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                        #{t.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#d8b056]/15 border border-[#d8b056]/30 text-[#d8b056] flex items-center justify-center font-bold text-sm shrink-0">
                            {t.avatar ? (
                              <img
                                src={t.avatar}
                                alt={t.client_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              t.client_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div
                              className="font-bold text-sm tracking-tight"
                              style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                            >
                              {t.client_name}
                            </div>
                            {t.client_role && (
                              <div
                                className="text-[11px] line-clamp-1"
                                style={{ color: isLight ? '#64748b' : '#94a3b8' }}
                              >
                                {t.client_role}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1 text-amber-400 mb-1">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <p
                          className="text-[11px] line-clamp-2 italic"
                          style={{ color: isLight ? '#334155' : '#cbd5e1' }}
                        >
                          "{t.review}"
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {t.destination_country && (
                          <div
                            className="font-semibold text-[11px]"
                            style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                          >
                            📍 {t.destination_country}
                          </div>
                        )}
                        {t.course_program && (
                          <div className="text-[10px] text-slate-400">
                            🎓 {t.course_program}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {t.is_featured ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d8b056]/15 text-[#d8b056] border border-[#d8b056]/30">
                            ★ Featured
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(t)}
                          disabled={isRowMutating}
                          title="Click to toggle status"
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            t.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'
                          }`}
                        >
                          {isRowMutating ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${t.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          )}
                          <span>{t.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(t)}
                            title="Edit Testimonial"
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isLight
                                ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                : 'hover:bg-[#1a1916] text-slate-400 hover:text-white'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(t)}
                            title="Delete Testimonial"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ---------------- MODALS (Unified Section 8 Standard) ---------------- */}

      {/* 1. ADD / EDIT TESTIMONIAL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg sm:max-w-xl rounded-3xl border p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#d8b056]/12 border border-[#d8b056]/28 text-[#d8b056] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Verified review will be displayed in the testimonials showcase.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                    Student / Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    placeholder="e.g. Aryan Sharma"
                    required
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                    Star Rating (1 - 5)
                  </label>
                  <div
                    className={`w-full rounded-xl px-2 py-1.5 border flex items-center justify-between ${inputClass}`}
                  >
                    {/* Left: Minus (-) Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          rating: Math.max(1, (prev.rating || 5) - 1),
                        }))
                      }
                      disabled={form.rating <= 1}
                      title="Decrease rating (min 1 star)"
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-[#d8b056]/20 hover:text-[#d8b056] dark:hover:bg-[#d8b056]/20 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                      </svg>
                    </button>

                    {/* Center: Single Star & Rating Counter */}
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-xl text-[#d8b056] drop-shadow-[0_1px_4px_rgba(216,176,86,0.45)]">
                        ★
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {form.rating || 5}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        / 5 Stars
                      </span>
                    </div>

                    {/* Right: Plus (+) Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          rating: Math.min(5, (prev.rating || 1) + 1),
                        }))
                      }
                      disabled={form.rating >= 5}
                      title="Increase rating (max 5 stars)"
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-[#d8b056]/20 hover:text-[#d8b056] dark:hover:bg-[#d8b056]/20 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Role / Institution / Tagline
                </label>
                <input
                  type="text"
                  value={form.client_role}
                  onChange={(e) => setForm({ ...form, client_role: e.target.value })}
                  placeholder="e.g. M.Sc Data Science Student, University of Leeds"
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                    Destination Country
                  </label>
                  <input
                    type="text"
                    value={form.destination_country}
                    onChange={(e) => setForm({ ...form, destination_country: e.target.value })}
                    placeholder="e.g. United Kingdom, USA, Germany, India"
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                    Course / Program
                  </label>
                  <input
                    type="text"
                    value={form.course_program}
                    onChange={(e) => setForm({ ...form, course_program: e.target.value })}
                    placeholder="e.g. MBBS, B.Tech, MBA"
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Review Content / Story <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  rows={4}
                  placeholder="Client feedback and guidance experience..."
                  required
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              {/* DP / Profile Photo - Drag and Drop File Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Profile Photo (DP)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[10px] text-slate-500 hover:text-[#d8b056] dark:text-slate-400 dark:hover:text-[#d8b056] transition underline cursor-pointer"
                  >
                    {showUrlInput ? 'Switch to Drag & Drop' : 'or enter image URL'}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAvatarFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {showUrlInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={form.avatar}
                      onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                      placeholder="https://... direct image URL"
                      className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                    />
                    {form.avatar && (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.avatar}
                          alt="Preview"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#d8b056]"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                          {form.avatar}
                        </span>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, avatar: '' })}
                          className="text-xs text-rose-500 hover:underline px-2 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                ) : form.avatar ? (
                  /* Compact Preview when DP is uploaded or set */
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-[#d8b056]/30 bg-[#d8b056]/[0.06] dark:bg-[#d8b056]/[0.08] transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-[#d8b056] shrink-0 shadow-sm bg-white dark:bg-[#121110]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.avatar}
                          alt="Student DP"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Photo Set
                          </span>
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                          {form.avatar}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#1f1d1a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-[#d8b056] transition cursor-pointer shadow-sm"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, avatar: '' })}
                        title="Remove photo"
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Compact Drag and Drop Area */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={(e) => {
                      if (isDroppingRef.current || avatarUploading) {
                        e.preventDefault();
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    className={`relative rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                      avatarDragOver
                        ? 'border-[#d8b056] bg-[#d8b056]/15 scale-[1.01]'
                        : isLight
                        ? 'border-slate-300 hover:border-[#d8b056] bg-slate-50/60 hover:bg-[#d8b056]/[0.04]'
                        : 'border-white/15 hover:border-[#d8b056] bg-white/[0.02] hover:bg-[#d8b056]/[0.05]'
                    }`}
                  >
                    {avatarUploading ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#d8b056] py-2">
                        <div className="w-4 h-4 border-2 border-[#d8b056] border-t-transparent rounded-full animate-spin" />
                        <span>Uploading profile photo...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#d8b056]/12 border border-[#d8b056]/30 text-[#d8b056] flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Drag & drop DP here, or <span className="text-[#d8b056] underline">browse</span>
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#d8b056] focus:ring-[#d8b056] cursor-pointer"
                  />
                  <label htmlFor="is_featured" className="text-xs font-bold cursor-pointer">
                    Mark as Featured Story
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#d8b056] focus:ring-[#d8b056] cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-xs font-bold cursor-pointer">
                    Review is Active & Visible
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer flex items-center gap-2"
                >
                  {actionLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingItem ? 'Update Testimonial' : 'Create Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DELETE TESTIMONIAL MODAL */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold">Delete Testimonial</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5">
              Are you sure you want to permanently delete the testimonial by{' '}
              <strong className="text-slate-900 dark:text-white font-bold">"{itemToDelete.client_name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#24221e]">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>Delete Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
