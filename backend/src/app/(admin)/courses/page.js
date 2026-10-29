'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  getAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  toggleAdminCourse,
  deleteAdminCourse,
  getAdminIndiaStreams,
  createAdminIndiaStream,
  updateAdminIndiaStream,
  toggleAdminIndiaStream,
  deleteAdminIndiaStream,
} from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';

export default function AdminCoursesPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  // Tabs: 'courses' | 'streams'
  const [activeTab, setActiveTab] = useState('courses');

  // Data states
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'undergraduate' | 'postgraduate'
  const [streamFilter, setStreamFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [streamDropdownOpen, setStreamDropdownOpen] = useState(false);
  const streamDropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setStreamDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setStreamDropdownOpen(false);
    }, 180);
  };

  // Close stream dropdown on click outside & unmount cleanup
  useEffect(() => {
    function handleClickOutside(event) {
      if (streamDropdownRef.current && !streamDropdownRef.current.contains(event.target)) {
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
        setStreamDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  // Row mutation tracking (optimistic toggle without full-page reloads)
  const [togglingCourseId, setTogglingCourseId] = useState(null);
  const [togglingStreamId, setTogglingStreamId] = useState(null);

  // Course Modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const initialCourseForm = {
    stream_id: '',
    course_name: '',
    level: 'undergraduate',
    entrance_exams: '',
    duration: '',
    eligibility: '',
    description: '',
    is_active: true,
    display_order: 1,
  };
  const [courseForm, setCourseForm] = useState(initialCourseForm);

  // Stream Modal state
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [deleteStreamModalOpen, setDeleteStreamModalOpen] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState(null);

  const initialStreamForm = {
    name: '',
    title: '',
    tagline: '',
    description: '',
    is_active: true,
    display_order: 1,
  };
  const [streamForm, setStreamForm] = useState(initialStreamForm);

  // Fetch initial data
  const fetchData = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      setError('');
      const [coursesData, streamsData] = await Promise.all([
        getAdminCourses(),
        getAdminIndiaStreams(),
      ]);
      const safeCourses = Array.isArray(coursesData)
        ? coursesData
        : Array.isArray(coursesData?.courses)
        ? coursesData.courses
        : Array.isArray(coursesData?.items)
        ? coursesData.items
        : Array.isArray(coursesData?.data)
        ? coursesData.data
        : [];
      const safeStreams = Array.isArray(streamsData)
        ? streamsData
        : Array.isArray(streamsData?.streams)
        ? streamsData.streams
        : Array.isArray(streamsData?.items)
        ? streamsData.items
        : Array.isArray(streamsData?.data)
        ? streamsData.data
        : [];
      setCourses(safeCourses);
      setStreams(safeStreams);
    } catch (err) {
      setError(err.message || 'Failed to load courses or streams.');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // ---------------- Stats Calculation ----------------
  const stats = useMemo(() => {
    const listC = Array.isArray(courses) ? courses : [];
    const listS = Array.isArray(streams) ? streams : [];
    const total = listC.length;
    const ug = listC.filter((c) => c.level === 'undergraduate').length;
    const pg = listC.filter((c) => c.level === 'postgraduate').length;
    const activeCourses = listC.filter((c) => c.is_active).length;
    const totalStreams = listS.length;
    return { total, ug, pg, activeCourses, totalStreams };
  }, [courses, streams]);

  // ---------------- Filtered Courses ----------------
  const filteredCourses = useMemo(() => {
    const listC = Array.isArray(courses) ? courses : [];
    return listC.filter((c) => {
      // Level filter
      if (levelFilter !== 'all' && c.level !== levelFilter) return false;
      // Stream filter
      if (streamFilter !== 'all' && String(c.stream_id) !== String(streamFilter)) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.course_name?.toLowerCase().includes(q);
        const matchesExams = c.entrance_exams?.toLowerCase().includes(q);
        const matchesStream = (c.stream?.name || c.stream?.title)?.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesExams && !matchesStream && !matchesDesc) return false;
      }
      return true;
    });
  }, [courses, levelFilter, streamFilter, searchQuery]);

  // ---------------- Course Handlers ----------------
  const openAddCourseModal = () => {
    setEditingCourse(null);
    setCourseForm({
      ...initialCourseForm,
      stream_id: streams.length > 0 ? streams[0].id : '',
      display_order: courses.length + 1,
    });
    setCourseModalOpen(true);
  };

  const openEditCourseModal = (course) => {
    setEditingCourse(course);
    setCourseForm({
      stream_id: course.stream_id || (streams[0]?.id ?? ''),
      course_name: course.course_name || '',
      level: course.level || 'undergraduate',
      entrance_exams: course.entrance_exams || '',
      duration: course.duration || '',
      eligibility: course.eligibility || '',
      description: course.description || '',
      is_active: Boolean(course.is_active),
      display_order: course.display_order ?? 1,
    });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.course_name.trim()) {
      alert('Please enter a course name (e.g. B.Ed, B.Tech, MBBS).');
      return;
    }
    if (!courseForm.stream_id) {
      alert('Please select a stream / category for this course.');
      return;
    }
    setActionLoading(true);
    try {
      if (editingCourse) {
        await updateAdminCourse(editingCourse.id, courseForm);
      } else {
        await createAdminCourse(courseForm);
      }
      setCourseModalOpen(false);
      await fetchData(false);
    } catch (err) {
      alert('Failed to save course: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCourse = async (course) => {
    if (togglingCourseId === course.id) return;
    setTogglingCourseId(course.id);

    // Optimistic toggle: immediately flip boolean in state (Zero page reload / flicker)
    const prevStatus = Boolean(course.is_active);
    const nextStatus = !prevStatus;

    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, is_active: nextStatus } : c))
    );

    try {
      await toggleAdminCourse(course.id);
    } catch (err) {
      // Revert if API fails
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, is_active: prevStatus } : c))
      );
      alert('Toggle failed: ' + (err.message || 'Server error'));
    } finally {
      setTogglingCourseId(null);
    }
  };

  const openDeleteCourseModal = (course) => {
    setCourseToDelete(course);
    setDeleteCourseModalOpen(true);
  };

  const handleConfirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setActionLoading(true);
    try {
      await deleteAdminCourse(courseToDelete.id);
      setDeleteCourseModalOpen(false);
      setCourseToDelete(null);
      await fetchData(false);
    } catch (err) {
      alert('Delete failed: ' + (err.message || 'Server error'));
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------- Stream Handlers ----------------
  const openAddStreamModal = () => {
    setEditingStream(null);
    setStreamForm({
      ...initialStreamForm,
      display_order: streams.length + 1,
    });
    setStreamModalOpen(true);
  };

  const openEditStreamModal = (stream) => {
    setEditingStream(stream);
    const streamName = stream.name || stream.title || '';
    setStreamForm({
      name: streamName,
      title: streamName,
      tagline: stream.tagline || '',
      description: stream.description || '',
      is_active: Boolean(stream.is_active),
      display_order: stream.display_order ?? 1,
    });
    setStreamModalOpen(true);
  };

  const handleSaveStream = async (e) => {
    e.preventDefault();
    const streamName = streamForm.name?.trim() || streamForm.title?.trim();
    if (!streamName) {
      alert('Please enter a stream name (e.g. Education & Teaching, Engineering).');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        ...streamForm,
        name: streamName,
        title: streamName,
      };
      if (editingStream) {
        await updateAdminIndiaStream(editingStream.id, payload);
      } else {
        await createAdminIndiaStream(payload);
      }
      setStreamModalOpen(false);
      await fetchData(false);
    } catch (err) {
      alert('Failed to save stream: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStream = async (stream) => {
    if (togglingStreamId === stream.id) return;
    setTogglingStreamId(stream.id);

    const prevStatus = Boolean(stream.is_active);
    const nextStatus = !prevStatus;

    setStreams((prev) =>
      prev.map((s) => (s.id === stream.id ? { ...s, is_active: nextStatus } : s))
    );

    try {
      await toggleAdminIndiaStream(stream.id);
    } catch (err) {
      setStreams((prev) =>
        prev.map((s) => (s.id === stream.id ? { ...s, is_active: prevStatus } : s))
      );
      alert('Toggle stream failed: ' + (err.message || 'Server error'));
    } finally {
      setTogglingStreamId(null);
    }
  };

  const openDeleteStreamModal = (stream) => {
    setStreamToDelete(stream);
    setDeleteStreamModalOpen(true);
  };

  const handleConfirmDeleteStream = async () => {
    if (!streamToDelete) return;
    setActionLoading(true);
    try {
      await deleteAdminIndiaStream(streamToDelete.id);
      setDeleteStreamModalOpen(false);
      setStreamToDelete(null);
      await fetchData(false);
    } catch (err) {
      alert('Delete stream failed: ' + (err.message || 'Server error'));
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
            <span>India Admissions</span>
            <span>•</span>
            <span>Degree & Course Registry</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            India Courses & Categories
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Manage Undergraduate & Postgraduate courses (B.Ed, B.Tech, MBBS, MBA, Law, Liberal Arts) and admission streams.
          </p>
        </div>

        {/* Tab Switcher & Quick Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`p-1 rounded-2xl border flex items-center gap-1 ${
              isLight ? 'bg-slate-100 border-slate-200/70' : 'bg-[#161513] border-[#292622]'
            }`}
          >
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courses'
                  ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
              </svg>
              <span>Courses ({courses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('streams')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'streams'
                  ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Streams ({streams.length})</span>
            </button>
          </div>

          {activeTab === 'courses' ? (
            <button
              onClick={openAddCourseModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/15 hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Course</span>
            </button>
          ) : (
            <button
              onClick={openAddStreamModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/15 hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${surfaceClass}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Courses
          </div>
          <div className="text-2xl font-black text-[#d8b056] mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Undergraduate & Postgraduate</div>
        </div>
        <div className={`p-4 rounded-2xl border ${surfaceClass}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Undergraduate (UG)
          </div>
          <div className="text-2xl font-black text-sky-500 mt-1">{stats.ug}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">B.Ed, B.Tech, MBBS, BA, BBA</div>
        </div>
        <div className={`p-4 rounded-2xl border ${surfaceClass}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Postgraduate (PG)
          </div>
          <div className="text-2xl font-black text-violet-400 mt-1">{stats.pg}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">M.Ed, M.Tech, MD, MS, MBA</div>
        </div>
        <div className={`p-4 rounded-2xl border ${surfaceClass}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Categories & Streams
          </div>
          <div className="text-2xl font-black text-emerald-500 mt-1">{stats.totalStreams}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Medicine, Engg, Education...</div>
        </div>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => fetchData(true)} className="underline hover:no-underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* TAB 1: COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className={`rounded-3xl border overflow-hidden ${surfaceClass}`}>
          {/* Filters Bar: Stream on Left, Search in Center, Level Segmented on Right */}
          <div
            className={`p-4 sm:p-5 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
              isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#24221e] bg-[#141311]'
            }`}
          >
            {/* 1. LEFT: Luxury Animated Stream Dropdown with Hover & Click Trigger */}
            <div
              className="relative w-full lg:w-auto min-w-[260px]"
              ref={streamDropdownRef}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Filter By Stream</span>
                <span className="text-[10px] font-mono text-[#d8b056]">
                  {streamFilter === 'all' ? `${streams.length} total` : 'Filtered'}
                </span>
              </label>

              {/* Trigger Button with luxury border, hover elevation & rotating chevron */}
              <button
                type="button"
                onClick={() => setStreamDropdownOpen(!streamDropdownOpen)}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold border flex items-center justify-between gap-3 transition-all duration-300 cursor-pointer shadow-sm ${
                  streamDropdownOpen
                    ? 'border-[#d8b056] ring-2 ring-[#d8b056]/20 shadow-[0_4px_20px_rgba(216,176,86,0.2)]'
                    : 'hover:border-[#d8b056]/60 hover:shadow-[0_4px_16px_rgba(216,176,86,0.12)] hover:-translate-y-0.5 active:translate-y-0'
                } ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#161513] border-[#292622] text-[#faf7f0]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 h-6 rounded-lg bg-[#d8b056]/15 border border-[#d8b056]/30 text-[#d8b056] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </span>
                  <span className="truncate">
                    {streamFilter === 'all'
                      ? `All Streams (${streams.length})`
                      : (streams.find((s) => String(s.id) === String(streamFilter))?.name ||
                         streams.find((s) => String(s.id) === String(streamFilter))?.title ||
                         `Stream #${streamFilter}`)}
                  </span>
                </div>

                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                    streamDropdownOpen ? 'rotate-180 text-[#d8b056]' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Animated Floating Popover List (Seamless Hover Bridge) */}
              {streamDropdownOpen && (
                <div
                  className={`absolute left-0 top-full mt-1.5 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-[''] w-full min-w-[280px] max-h-80 overflow-y-auto rounded-2xl border shadow-2xl z-50 p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 ${
                    isLight
                      ? 'bg-white/98 border-slate-200 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.18)]'
                      : 'bg-[#141311]/98 border-[#292622] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)]'
                  }`}
                >
                  {/* "All Streams" Option */}
                  <button
                    type="button"
                    onClick={() => {
                      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                      setStreamFilter('all');
                      setStreamDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      streamFilter === 'all'
                        ? 'bg-[#d8b056]/15 text-[#d8b056] border border-[#d8b056]/30'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-800'
                        : 'hover:bg-[#1f1d1a] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#d8b056]"></span>
                      <span>All Streams & Categories</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800 text-slate-500">
                        {courses.length} courses
                      </span>
                      {streamFilter === 'all' && (
                        <svg className="w-4 h-4 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-[#22201d]"></div>

                  {/* Stream Items List */}
                  {streams.map((s) => {
                    const isSelected = String(s.id) === String(streamFilter);
                    const sCourses = courses.filter((c) => c.stream_id === s.id);
                    const name = s.name || s.title || `Stream #${s.id}`;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                          setStreamFilter(s.id);
                          setStreamDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-150 cursor-pointer my-0.5 ${
                          isSelected
                            ? 'bg-[#d8b056]/15 text-[#d8b056] font-bold border border-[#d8b056]/30'
                            : isLight
                            ? 'hover:bg-slate-100 text-slate-700'
                            : 'hover:bg-[#1f1d1a] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                          <span className="truncate">{name}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {sCourses.length} {sCourses.length === 1 ? 'course' : 'courses'}
                          </span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. CENTER: Luxury Search Input with Hover & Glow Effect */}
            <div className="relative flex-1 max-w-lg w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Search Registry</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {searchQuery ? `${filteredCourses.length} matching` : 'Live Filter'}
                </span>
              </label>

              <div
                className={`group relative rounded-2xl border transition-all duration-300 flex items-center shadow-sm ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-[#d8b056]/70 focus-within:border-[#d8b056] focus-within:ring-4 focus-within:ring-[#d8b056]/15 hover:shadow-[0_4px_22px_-2px_rgba(216,176,86,0.18)] focus-within:shadow-[0_6px_28px_-2px_rgba(216,176,86,0.22)]'
                    : 'bg-[#161513] border-[#292622] hover:border-[#d8b056]/70 focus-within:border-[#d8b056] focus-within:ring-4 focus-within:ring-[#d8b056]/20 hover:shadow-[0_4px_22px_-2px_rgba(216,176,86,0.18)] focus-within:shadow-[0_6px_28px_-2px_rgba(216,176,86,0.25)]'
                }`}
              >
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 group-hover:text-[#d8b056] group-focus-within:text-[#d8b056] transition-all duration-300">
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by course (B.Ed, MBBS, B.Tech), exam (NEET, JEE), or stream..."
                  className="w-full pl-10 pr-20 py-2.5 rounded-2xl text-xs font-medium bg-transparent outline-none border-none focus:ring-0 text-slate-900 dark:text-[#faf7f0] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                <div className="absolute right-3 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 hover:rotate-90 hover:scale-110 transition-all duration-200 cursor-pointer text-xs"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#2a2824] text-slate-400 group-hover:border-[#d8b056]/40 group-hover:text-[#d8b056] transition-colors duration-200 pointer-events-none">
                      Live Search
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. RIGHT: Premium Animated Level Switcher */}
            <div className="w-full lg:w-auto shrink-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Degree Level</span>
                <span className="text-[10px] font-mono text-[#d8b056] uppercase">
                  {levelFilter === 'all' ? 'All' : levelFilter === 'undergraduate' ? 'UG' : 'PG'}
                </span>
              </label>

              <div
                className={`p-1.5 rounded-2xl border flex items-center gap-1.5 shadow-sm transition-all duration-300 ${
                  isLight ? 'bg-slate-100/90 border-slate-200/80' : 'bg-[#141311] border-[#292622]'
                }`}
              >
                {/* All Levels Button */}
                <button
                  onClick={() => setLevelFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    levelFilter === 'all'
                      ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/25 scale-[1.03]'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-[#1a1916] hover:scale-[1.02]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>All</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      levelFilter === 'all'
                        ? 'bg-black/15 text-[#0b0b0c]'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {stats.total}
                  </span>
                </button>

                {/* Undergraduate (UG) Button with vibrant Cyan/Sky gradient */}
                <button
                  onClick={() => setLevelFilter('undergraduate')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    levelFilter === 'undergraduate'
                      ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/35 scale-[1.03]'
                      : isLight
                      ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-500/10 hover:scale-[1.02]'
                      : 'text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 hover:scale-[1.02]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                  </svg>
                  <span>UG</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      levelFilter === 'undergraduate'
                        ? 'bg-white/20 text-white'
                        : 'bg-sky-500/15 text-sky-500'
                    }`}
                  >
                    {stats.ug}
                  </span>
                </button>

                {/* Postgraduate (PG) Button with vibrant Violet/Purple gradient */}
                <button
                  onClick={() => setLevelFilter('postgraduate')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    levelFilter === 'postgraduate'
                      ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-purple-700 text-white shadow-md shadow-purple-500/35 scale-[1.03]'
                      : isLight
                      ? 'text-slate-600 hover:text-violet-600 hover:bg-violet-500/10 hover:scale-[1.02]'
                      : 'text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 hover:scale-[1.02]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>PG</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      levelFilter === 'postgraduate'
                        ? 'bg-white/20 text-white'
                        : 'bg-violet-500/15 text-violet-400'
                    }`}
                  >
                    {stats.pg}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Container with Horizontal Scroll Integrity */}
          <div className="overflow-x-auto min-w-full">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#d8b056]/30 border-t-[#d8b056] rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-semibold text-slate-400">Loading courses registry...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  No courses found
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || levelFilter !== 'all' || streamFilter !== 'all'
                    ? 'No courses matched your current filter criteria. Try resetting filters.'
                    : 'Get started by creating your first course program.'}
                </p>
                <button
                  onClick={openAddCourseModal}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#d8b056] text-[#0b0b0c] hover:brightness-105 transition cursor-pointer"
                >
                  + Add First Course
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
                    <th className="py-3.5 px-4">Course Name & Level</th>
                    <th className="py-3.5 px-4">Stream / Category</th>
                    <th className="py-3.5 px-4">Entrance Exams</th>
                    <th className="py-3.5 px-4">Duration & Eligibility</th>
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
                  {filteredCourses.map((c, idx) => {
                    const isUG = c.level === 'undergraduate';
                    const isRowMutating = togglingCourseId === c.id;

                    return (
                      <tr
                        key={c.id}
                        className="transition-none"
                        style={{
                          backgroundColor: isLight ? '#ffffff' : '#100f0e',
                        }}
                      >
                        {/* ID Number */}
                        <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                          #{c.id}
                        </td>

                        {/* Course Name & Level Badge */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Link
                              href={`/courses/curriculum/?course_id=${c.id}`}
                              className="font-bold text-sm tracking-tight hover:text-[#d8b056] transition inline-flex items-center gap-1.5 group cursor-pointer"
                              style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                              title="Click to view full course syllabus, subjects, topics & subtopics breakdown"
                            >
                              <span className="group-hover:text-[#d8b056] transition-colors">{c.course_name}</span>
                              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#d8b056] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                isUG
                                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                  : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                              }`}
                            >
                              {isUG ? 'UG' : 'PG'}
                            </span>
                          </div>
                          {c.description && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {c.description}
                            </div>
                          )}
                        </td>

                        {/* Stream Category */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-[#c89b3c] dark:text-[#eedb9f] border border-[#d8b056]/20">
                            <span>{c.stream?.name || c.stream?.title || 'General'}</span>
                          </div>
                        </td>

                        {/* Entrance Exams */}
                        <td className="py-3.5 px-4">
                          {c.entrance_exams ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {c.entrance_exams.split(',').map((exam, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                    isLight
                                      ? 'bg-slate-100 border-slate-200 text-slate-700'
                                      : 'bg-[#181715] border-[#2d2a25] text-slate-300'
                                  }`}
                                >
                                  {exam.trim()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Direct / Merit</span>
                          )}
                        </td>

                        {/* Duration & Eligibility */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div className="font-semibold text-[11px]">
                            {c.duration || 'N/A'}
                          </div>
                          {c.eligibility && (
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {c.eligibility}
                            </div>
                          )}
                        </td>

                        {/* Optimistic Status Toggle (Zero Reload) */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleCourse(c)}
                            disabled={isRowMutating}
                            title="Click to toggle Active / Inactive"
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              c.is_active
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'
                            }`}
                          >
                            {isRowMutating ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            )}
                            <span>{c.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Action buttons (Curriculum, Edit & Delete) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              href={`/courses/curriculum/?course_id=${c.id}`}
                              title="Curriculum & Syllabus Breakdown (Subjects -> Topics -> Subtopics)"
                              className="p-1.5 rounded-lg text-[#d8b056] hover:bg-[#d8b056]/15 transition cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => openEditCourseModal(c)}
                              title="Edit Course"
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
                              onClick={() => openDeleteCourseModal(c)}
                              title="Delete Course"
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
      )}

      {/* TAB 2: STREAMS & CATEGORIES MANAGEMENT */}
      {activeTab === 'streams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((s) => {
              const streamCourses = courses.filter((c) => c.stream_id === s.id);
              const ugCount = streamCourses.filter((c) => c.level === 'undergraduate').length;
              const pgCount = streamCourses.filter((c) => c.level === 'postgraduate').length;
              const isRowMutating = togglingStreamId === s.id;

              return (
                <div
                  key={s.id}
                  className={`p-5 rounded-3xl border transition-all ${surfaceClass} flex flex-col justify-between`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                          Slug: {s.slug}
                        </div>
                        <h3 className={`text-lg font-bold tracking-tight mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {s.name || s.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleToggleStream(s)}
                        disabled={isRowMutating}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          s.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                            : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                        }`}
                      >
                        {isRowMutating ? (
                          <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        )}
                        <span>{s.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </div>

                    {/* Tagline & Description */}
                    {s.tagline && (
                      <p className={`text-xs mt-2 italic font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        "{s.tagline}"
                      </p>
                    )}
                    {s.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {s.description}
                      </p>
                    )}

                    {/* Course Counts Breakdown */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#24221e] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[11px]">
                          UG: {ugCount}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-[11px]">
                          PG: {pgCount}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Total: {streamCourses.length} courses
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#24221e] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setStreamFilter(s.id);
                        setActiveTab('courses');
                      }}
                      className="text-xs font-bold text-[#d8b056] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View Courses</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditStreamModal(s)}
                        title="Edit Stream"
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-[#1a1916] text-slate-300'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteStreamModal(s)}
                        title="Delete Stream"
                        className="p-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- MODALS (Unified Section 8 Standard) ---------------- */}

      {/* 1. ADD / EDIT COURSE MODAL */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-3xl border p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#d8b056]/12 border border-[#d8b056]/28 text-[#d8b056] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    {editingCourse ? 'Edit Course Program' : 'Add New Course Program'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure program details, degree level, and entrance exams.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCourse} className="space-y-4 pt-5">
              {/* Category / Stream and Level in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                    Category / Stream <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={courseForm.stream_id}
                    onChange={(e) => setCourseForm({ ...courseForm, stream_id: e.target.value })}
                    required
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                    style={{
                      backgroundColor: isLight ? '#ffffff' : '#161513',
                      color: isLight ? '#0f172a' : '#faf7f0',
                    }}
                  >
                    <option
                      value=""
                      style={{ backgroundColor: isLight ? '#ffffff' : '#161513', color: isLight ? '#0f172a' : '#faf7f0' }}
                    >
                      Select Stream
                    </option>
                    {streams.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                        style={{ backgroundColor: isLight ? '#ffffff' : '#161513', color: isLight ? '#0f172a' : '#faf7f0' }}
                      >
                        {s.name || s.title || `Stream #${s.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                    Degree Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    required
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                  >
                    <option value="undergraduate">Undergraduate (UG)</option>
                    <option value="postgraduate">Postgraduate (PG)</option>
                  </select>
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Course Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseForm.course_name}
                  onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                  placeholder="e.g. B.Ed (Bachelor of Education), MBBS, B.Tech CSE, MBA"
                  required
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              {/* Entrance Exams */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Entrance Exams (Comma separated)
                </label>
                <input
                  type="text"
                  value={courseForm.entrance_exams}
                  onChange={(e) => setCourseForm({ ...courseForm, entrance_exams: e.target.value })}
                  placeholder="e.g. NEET-UG, JEE Main, JEE Advanced, State B.Ed CET, CUET-UG"
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Multiple exams will be rendered as clean chips on public admission cards.
                </span>
              </div>

              {/* Duration and Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="e.g. 2 Years, 4 Years, 5.5 Years"
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    value={courseForm.eligibility}
                    onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                    placeholder="e.g. 10+2 with 50% in PCM, Graduation"
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Description / Guidance Highlights
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows={3}
                  placeholder="Brief guidance notes for students and counsellors..."
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              {/* Display Order */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Display Order
                </label>
                <input
                  type="number"
                  value={courseForm.display_order}
                  onChange={(e) => setCourseForm({ ...courseForm, display_order: parseInt(e.target.value) || 1 })}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
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
                  <span>{editingCourse ? 'Update Course' : 'Create Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DELETE COURSE MODAL */}
      {deleteCourseModalOpen && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold">Delete Course</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 dark:text-white font-bold">"{courseToDelete.course_name}"</strong> from{' '}
              <span className="font-semibold">{courseToDelete.stream?.name || courseToDelete.stream?.title}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#24221e]">
              <button
                type="button"
                onClick={() => setDeleteCourseModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>Delete Program</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD / EDIT STREAM MODAL */}
      {streamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#d8b056]/12 border border-[#d8b056]/28 text-[#d8b056] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    {editingStream ? 'Edit Stream / Category' : 'Add New Category'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage category title, tagline, and guidance description.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStreamModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStream} className="space-y-4 pt-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Stream Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={streamForm.name || streamForm.title}
                  onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value, title: e.target.value })}
                  placeholder="e.g. Education & Teaching, Architecture, Pure Sciences"
                  required
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Tagline
                </label>
                <input
                  type="text"
                  value={streamForm.tagline}
                  onChange={(e) => setStreamForm({ ...streamForm, tagline: e.target.value })}
                  placeholder="e.g. B.Ed, M.Ed & Teacher Eligibility Guidance"
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  value={streamForm.description}
                  onChange={(e) => setStreamForm({ ...streamForm, description: e.target.value })}
                  rows={3}
                  placeholder="Counselling and admission guidance description..."
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Display Order
                </label>
                <input
                  type="number"
                  value={streamForm.display_order}
                  onChange={(e) => setStreamForm({ ...streamForm, display_order: parseInt(e.target.value) || 1 })}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-medium border ${inputClass}`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setStreamModalOpen(false)}
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
                  <span>{editingStream ? 'Update Stream' : 'Create Stream'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DELETE STREAM MODAL */}
      {deleteStreamModalOpen && streamToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold">Delete Stream</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">All associated courses will be removed.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 dark:text-white font-bold">"{streamToDelete.name || streamToDelete.title}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#24221e]">
              <button
                type="button"
                onClick={() => setDeleteStreamModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStream}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>Delete Stream</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
