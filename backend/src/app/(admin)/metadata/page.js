'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  getAdminMetadata,
  getAdminMetadataHierarchy,
  createAdminMetadata,
  updateAdminMetadata,
  toggleAdminMetadata,
  deleteAdminMetadata,
} from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';
import AdminCustomSelect from '../AdminCustomSelect.js';

export default function AdminMetadataPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  // Master data states
  const [items, setItems] = useState([]);
  const [hierarchy, setHierarchy] = useState({
    courses: [],
    subjects: [],
    topics: [],
    subtopics: [],
    subjectsByCourse: {},
    topicsBySubject: {},
    relationalSubjectsByCourse: {},
    relationalTopicsBySubject: {},
    relationalSubtopicsByTopic: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Cascading Filters (Course -> Subject -> Topic -> Search)
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Row-level mutation tracking (optimistic toggle without full-page reloads)
  const [togglingId, setTogglingId] = useState(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form State for Add / Edit Modal (3NF Relational Curriculum Architecture)
  const initialForm = {
    course_id: '',
    subject_id: '',
    subject: '',
    isNewSubject: false,
    topic_id: '',
    topic: '',
    isNewTopic: false,
    subtopic_id: '',
    subtopic: '',
    isNewSubtopic: false,
    description: '',
    display_order: 1,
    is_active: true,
  };
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');

  // Flash Feedback Message (Top Banner - Admin Standard)
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: 'success' });
  const showFeedback = useCallback((text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: 'success' }), 4000);
  }, []);

  // Fetch data & hierarchy from backend
  const fetchData = useCallback(async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      setError('');

      const [metadataRes, hierarchyRes] = await Promise.all([
        getAdminMetadata(),
        getAdminMetadataHierarchy().catch(() => ({ courses: [], subjectsByCourse: {}, topicsBySubject: {} })),
      ]);

      const list = Array.isArray(metadataRes)
        ? metadataRes
        : Array.isArray(metadataRes?.data)
        ? metadataRes.data
        : [];

      setItems(list);

      const hData = hierarchyRes?.courses ? hierarchyRes : hierarchyRes?.data || {};
      setHierarchy({
        courses: hData.courses || [],
        subjects: hData.subjects || [],
        topics: hData.topics || [],
        subtopics: hData.subtopics || [],
        subjectsByCourse: hData.subjectsByCourse || {},
        topicsBySubject: hData.topicsBySubject || {},
        relationalSubjectsByCourse: hData.relationalSubjectsByCourse || {},
        relationalTopicsBySubject: hData.relationalTopicsBySubject || {},
        relationalSubtopicsByTopic: hData.relationalSubtopicsByTopic || {},
      });
    } catch (err) {
      setError(err.message || 'Failed to load course metadata.');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Derived available subjects for current selected course in filter (Strict 3NF)
  const availableSubjectsForFilter = useMemo(() => {
    if (selectedCourseId === 'all') {
      const allSubs = new Set();
      Object.values(hierarchy.subjectsByCourse || {}).forEach((arr) => {
        if (Array.isArray(arr)) arr.forEach((s) => allSubs.add(s));
      });
      return Array.from(allSubs).sort();
    }
    const relSubs = hierarchy.relationalSubjectsByCourse?.[selectedCourseId] || [];
    if (relSubs.length > 0) {
      return relSubs.map((s) => s.name).sort();
    }
    return hierarchy.subjectsByCourse?.[selectedCourseId] || [];
  }, [selectedCourseId, hierarchy]);

  // Derived available topics for current selected course & subject in filter (Strict 3NF)
  const availableTopicsForFilter = useMemo(() => {
    if (selectedCourseId !== 'all' && selectedSubject !== 'all') {
      // Find subject id from hierarchy.subjects or relationalSubjectsByCourse
      const relSubs = hierarchy.relationalSubjectsByCourse?.[selectedCourseId] || [];
      const subObj = relSubs.find((s) => s.name === selectedSubject);
      if (subObj && hierarchy.relationalTopicsBySubject?.[subObj.id]) {
        return hierarchy.relationalTopicsBySubject[subObj.id].map((t) => t.name).sort();
      }
      const key = `${selectedCourseId}::${selectedSubject}`;
      return hierarchy.topicsBySubject?.[key] || [];
    }
    if (selectedSubject !== 'all') {
      const topics = new Set();
      // Look up via relational topics if subject id matches
      const subObj = hierarchy.subjects?.find((s) => s.name === selectedSubject);
      if (subObj && hierarchy.relationalTopicsBySubject?.[subObj.id]) {
        hierarchy.relationalTopicsBySubject[subObj.id].forEach((t) => topics.add(t.name));
      }
      Object.entries(hierarchy.topicsBySubject || {}).forEach(([k, list]) => {
        if (k.endsWith(`::${selectedSubject}`) && Array.isArray(list)) {
          list.forEach((t) => topics.add(t));
        }
      });
      return Array.from(topics).sort();
    }
    const allTopics = new Set();
    Object.values(hierarchy.topicsBySubject || {}).forEach((list) => {
      if (Array.isArray(list)) list.forEach((t) => allTopics.add(t));
    });
    return Array.from(allTopics).sort();
  }, [selectedCourseId, selectedSubject, hierarchy]);

  // Available subjects for the Add / Edit modal based on form.course_id
  const availableSubjectsForForm = useMemo(() => {
    if (!form.course_id) return [];
    return hierarchy.relationalSubjectsByCourse?.[String(form.course_id)] || [];
  }, [form.course_id, hierarchy.relationalSubjectsByCourse]);

  // Available topics for the Add / Edit modal based on form.subject_id
  const availableTopicsForForm = useMemo(() => {
    if (!form.subject_id) return [];
    return hierarchy.relationalTopicsBySubject?.[String(form.subject_id)] || [];
  }, [form.subject_id, hierarchy.relationalTopicsBySubject]);

  // Available subtopics for the Add / Edit modal based on form.topic_id
  const availableSubtopicsForForm = useMemo(() => {
    if (!form.topic_id) return [];
    let list = hierarchy.relationalSubtopicsByTopic?.[String(form.topic_id)] || [];
    if (list.length === 0 && Array.isArray(hierarchy.subtopics)) {
      list = hierarchy.subtopics.filter((st) => String(st.topic_id) === String(form.topic_id));
    }
    return list;
  }, [form.topic_id, hierarchy.relationalSubtopicsByTopic, hierarchy.subtopics]);

  // Selected Course Object (for display tags)
  const selectedCourseObj = useMemo(() => {
    if (selectedCourseId === 'all') return null;
    return hierarchy.courses.find((c) => String(c.id) === String(selectedCourseId)) || null;
  }, [selectedCourseId, hierarchy.courses]);

  // Handle course filter change with cascading reset
  const handleCourseFilterChange = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedSubject('all');
    setSelectedTopic('all');
  };

  // Handle subject filter change with cascading reset
  const handleSubjectFilterChange = (subject) => {
    setSelectedSubject(subject);
    setSelectedTopic('all');
  };

  // Reset all cascading filters
  const resetFilters = () => {
    setSelectedCourseId('all');
    setSelectedSubject('all');
    setSelectedTopic('all');
    setSearchQuery('');
    setStatusFilter('all');
  };

  // KPI Stats
  const stats = useMemo(() => {
    const total = items.length;
    const coursesCount = new Set(items.map((i) => i.course_id).filter(Boolean)).size || hierarchy.courses.length;
    const subjectsCount = new Set(items.map((i) => i.subject).filter(Boolean)).size || (hierarchy.subjects?.length ?? 0);
    const topicsCount = new Set(items.map((i) => i.topic).filter(Boolean)).size || (hierarchy.topics?.length ?? 0);
    const activeCount = items.filter((i) => Boolean(i.is_active)).length;
    return { total, coursesCount, subjectsCount, topicsCount, activeCount };
  }, [items, hierarchy]);

  // Filtered Table Records
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCourseId !== 'all' && String(item.course_id) !== String(selectedCourseId)) {
        return false;
      }
      if (selectedSubject !== 'all' && item.subject !== selectedSubject) {
        return false;
      }
      if (selectedTopic !== 'all' && item.topic !== selectedTopic) {
        return false;
      }
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active';
        if (Boolean(item.is_active) !== isActive) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const courseName = item.course?.course_name || item.course_name || '';
        const inCourse = courseName.toLowerCase().includes(q);
        const inSubject = item.subject?.toLowerCase().includes(q);
        const inTopic = item.topic?.toLowerCase().includes(q);
        const inSubtopic = item.subtopic?.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        if (!inCourse && !inSubject && !inTopic && !inSubtopic && !inDesc) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCourseId, selectedSubject, selectedTopic, statusFilter, searchQuery]);

  // Handlers for Add / Edit Modal (Cascading 3NF Selection)
  const openAddModal = () => {
    setEditingItem(null);
    setFormError('');
    const defaultCourseId = selectedCourseId !== 'all' ? selectedCourseId : (hierarchy.courses[0]?.id || '');
    const subjectsForC = defaultCourseId ? (hierarchy.relationalSubjectsByCourse?.[String(defaultCourseId)] || []) : [];
    const firstSubject = subjectsForC[0];
    const topicsForS = firstSubject ? (hierarchy.relationalTopicsBySubject?.[String(firstSubject.id)] || []) : [];
    const firstTopic = topicsForS[0];

    setForm({
      ...initialForm,
      course_id: defaultCourseId ? String(defaultCourseId) : '',
      subject_id: firstSubject ? String(firstSubject.id) : '',
      subject: firstSubject ? firstSubject.name : '',
      isNewSubject: subjectsForC.length === 0,
      topic_id: firstTopic ? String(firstTopic.id) : '',
      topic: firstTopic ? firstTopic.name : '',
      isNewTopic: topicsForS.length === 0,
      subtopic_id: '',
      subtopic: '',
      isNewSubtopic: true,
      display_order: items.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormError('');
    setForm({
      course_id: item.course_id ? String(item.course_id) : '',
      subject_id: item.subject_id ? String(item.subject_id) : '',
      subject: item.subject || '',
      isNewSubject: !item.subject_id,
      topic_id: item.topic_id ? String(item.topic_id) : '',
      topic: item.topic || '',
      isNewTopic: !item.topic_id,
      subtopic_id: item.subtopic_id ? String(item.subtopic_id) : '',
      subtopic: item.subtopic || '',
      isNewSubtopic: !item.subtopic_id,
      description: item.description || '',
      display_order: item.display_order ?? 1,
      is_active: Boolean(item.is_active),
    });
    setModalOpen(true);
  };

  // Cascading Course change in modal
  const handleModalCourseChange = (newCourseId) => {
    const subjectsForC = newCourseId ? (hierarchy.relationalSubjectsByCourse?.[String(newCourseId)] || []) : [];
    const firstSubject = subjectsForC[0];
    const topicsForS = firstSubject ? (hierarchy.relationalTopicsBySubject?.[String(firstSubject.id)] || []) : [];
    const firstTopic = topicsForS[0];

    setForm((prev) => ({
      ...prev,
      course_id: newCourseId,
      subject_id: firstSubject ? String(firstSubject.id) : '',
      subject: firstSubject ? firstSubject.name : '',
      isNewSubject: subjectsForC.length === 0,
      topic_id: firstTopic ? String(firstTopic.id) : '',
      topic: firstTopic ? firstTopic.name : '',
      isNewTopic: topicsForS.length === 0,
      subtopic_id: '',
      subtopic: '',
      isNewSubtopic: true,
    }));
  };

  // Cascading Subject change in modal
  const handleModalSubjectChange = (newSubjectId) => {
    if (newSubjectId === '__new__') {
      setForm((prev) => ({
        ...prev,
        subject_id: '',
        subject: '',
        isNewSubject: true,
        topic_id: '',
        topic: '',
        isNewTopic: true,
        subtopic_id: '',
        subtopic: '',
        isNewSubtopic: true,
      }));
      return;
    }

    const foundSubject = availableSubjectsForForm.find((s) => String(s.id) === String(newSubjectId));
    const topicsForS = newSubjectId ? (hierarchy.relationalTopicsBySubject?.[String(newSubjectId)] || []) : [];
    const firstTopic = topicsForS[0];

    setForm((prev) => ({
      ...prev,
      subject_id: newSubjectId,
      subject: foundSubject ? foundSubject.name : prev.subject,
      isNewSubject: false,
      topic_id: firstTopic ? String(firstTopic.id) : '',
      topic: firstTopic ? firstTopic.name : '',
      isNewTopic: topicsForS.length === 0,
      subtopic_id: '',
      subtopic: '',
      isNewSubtopic: true,
    }));
  };

  // Cascading Topic change in modal
  const handleModalTopicChange = (newTopicId) => {
    if (newTopicId === '__new__') {
      setForm((prev) => ({
        ...prev,
        topic_id: '',
        topic: '',
        isNewTopic: true,
        subtopic_id: '',
        subtopic: '',
        isNewSubtopic: true,
      }));
      return;
    }

    const foundTopic = availableTopicsForForm.find((t) => String(t.id) === String(newTopicId));
    setForm((prev) => ({
      ...prev,
      topic_id: newTopicId,
      topic: foundTopic ? foundTopic.name : prev.topic,
      isNewTopic: false,
      subtopic_id: '',
      subtopic: '',
      isNewSubtopic: true,
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.course_id) {
      setFormError('Please select a course from the master courses table.');
      return;
    }
    if (!form.subject?.trim()) {
      setFormError('Subject name is required.');
      return;
    }
    if (!form.topic?.trim()) {
      setFormError('Topic name is required.');
      return;
    }
    if (!form.subtopic?.trim()) {
      setFormError('Subtopic title is required.');
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        course_id: parseInt(form.course_id, 10),
        subject_id: form.subject_id && !form.isNewSubject ? parseInt(form.subject_id, 10) : null,
        topic_id: form.topic_id && !form.isNewTopic ? parseInt(form.topic_id, 10) : null,
        subtopic_id: form.subtopic_id && !form.isNewSubtopic ? parseInt(form.subtopic_id, 10) : null,
        subject: form.subject.trim(),
        topic: form.topic.trim(),
        subtopic: form.subtopic.trim(),
        description: form.description ? form.description.trim() : null,
        display_order: parseInt(form.display_order || 1, 10),
        is_active: Boolean(form.is_active),
      };

      if (editingItem) {
        const updated = await updateAdminMetadata(editingItem.id, payload);
        const resolvedItem = updated?.data || updated;
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...resolvedItem } : i))
        );
        showFeedback(`Metadata "${resolvedItem.subtopic || form.subtopic}" updated successfully.`);
      } else {
        const created = await createAdminMetadata(payload);
        const resolvedItem = created?.data || created;
        setItems((prev) => [resolvedItem, ...prev]);
        showFeedback(`New subtopic "${resolvedItem.subtopic || form.subtopic}" created successfully.`);
      }

      setModalOpen(false);

      // Refresh hierarchy in background
      getAdminMetadataHierarchy().then((h) => {
        const hData = h?.courses ? h : h?.data || {};
        setHierarchy({
          courses: hData.courses || [],
          subjects: hData.subjects || [],
          topics: hData.topics || [],
          subtopics: hData.subtopics || [],
          subjectsByCourse: hData.subjectsByCourse || {},
          topicsBySubject: hData.topicsBySubject || {},
          relationalSubjectsByCourse: hData.relationalSubjectsByCourse || {},
          relationalTopicsBySubject: hData.relationalTopicsBySubject || {},
          relationalSubtopicsByTopic: hData.relationalSubtopicsByTopic || {},
        });
      }).catch(() => {});
    } catch (err) {
      setFormError(err.message || 'Operation failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Optimistic Row-Level Status Toggle
  const handleToggle = async (item) => {
    const oldStatus = item.is_active;
    const newStatus = !oldStatus;

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_active: newStatus } : i))
    );
    setTogglingId(item.id);

    try {
      await toggleAdminMetadata(item.id);
    } catch (err) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: oldStatus } : i))
      );
      showFeedback(err.message || 'Failed to toggle status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Modal Handlers
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading(true);
      await deleteAdminMetadata(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      showFeedback('Metadata subtopic deleted successfully.');
      getAdminMetadataHierarchy().then((h) => {
        const hData = h?.courses ? h : h?.data || { courses: [], subjectsByCourse: {}, topicsBySubject: {} };
        setHierarchy(hData);
      }).catch(() => {});
    } catch (err) {
      showFeedback(err.message || 'Failed to delete metadata.', 'error');
    } finally {
      setActionLoading(false);
      setItemToDelete(null);
    }
  };

  // Theme styling tokens
  const surfaceClass = isLight
    ? 'bg-white border-slate-100 shadow-[0_10px_30px_-4px_rgba(15,23,42,0.05)] text-slate-800'
    : 'bg-[#100f0e] border-[#24221e] shadow-[0_10px_30px_-4px_rgba(0,0,0,0.5)] text-slate-100';

  const inputClass = isLight
    ? 'bg-white border-slate-200 text-slate-800 focus:border-[#d8b056] focus:ring-[#d8b056]/20'
    : 'bg-[#141311] border-[#2a2824] text-slate-100 focus:border-[#d8b056] focus:ring-[#d8b056]/20';

  return (
    <div className="space-y-6">
      {/* Flash Feedback Banner (Standard HopeFairy Admin Banner) */}
      {feedbackMsg.text && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200 ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <svg
              className={`w-4 h-4 shrink-0 ${feedbackMsg.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {feedbackMsg.type === 'error' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              )}
            </svg>
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg({ text: '', type: 'success' })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d8b056]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056]">
              Academic Curriculum Master
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight mt-1 ${isLight ? 'text-slate-900' : 'text-[#faf7f0]'}`}>
            Course Metadata & Curriculum
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hierarchical syllabus structure (Courses Table → Subject → Topic → Subtopic). Study materials are managed in the{' '}
            <Link href="/resources" className="text-[#d8b056] font-semibold underline hover:brightness-110">
              Resources Store
            </Link>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/resources"
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
              isLight
                ? 'border-[#d8b056]/40 text-[#c89b3c] bg-[#d8b056]/10 hover:bg-[#d8b056]/20'
                : 'border-[#d8b056]/40 text-[#d8b056] bg-[#d8b056]/10 hover:bg-[#d8b056]/20'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Open Resources Store &rarr;</span>
          </Link>

          <button
            onClick={() => fetchData(true)}
            title="Refresh list"
            className={`p-2.5 rounded-xl border text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer ${
              isLight ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-[#24221e] bg-[#141311] hover:bg-[#1a1916]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition cursor-pointer flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Metadata / Subtopic</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Interactive with Luxury Hover Effects & Standard Prominent Typography) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Total Subtopics */}
        <div
          onClick={resetFilters}
          title="Click to view all subtopics"
          className={`admin-stat-card group relative p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(216,176,86,0.22)] hover:border-[#d8b056]/80 ${surfaceClass}`}
        >
          {/* Ambient Corner Glow on Hover */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-[#d8b056]/25 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#d8b056] transition-colors">
              Total Subtopics
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#d8b056]/10 text-[#d8b056] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#d8b056]/25 transition-all duration-300 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-[#d8b056] group-hover:scale-[1.03] transition-transform origin-left tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Syllabus breakdown units</span>
            <span className="opacity-0 group-hover:opacity-100 text-[#d8b056] text-xs font-bold transition-opacity">View all &rarr;</span>
          </div>
        </div>

        {/* Card 2: Master Courses */}
        <div
          onClick={() => {
            setSelectedCourseId('all');
            setSelectedSubject('all');
            setSelectedTopic('all');
          }}
          title="Click to reset course selection"
          className={`admin-stat-card group relative p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(59,130,246,0.22)] hover:border-blue-500/70 ${surfaceClass}`}
        >
          {/* Ambient Corner Glow on Hover */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-500/25 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">
              Master Courses
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:bg-blue-500/25 transition-all duration-300 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black mt-2 group-hover:scale-[1.03] transition-transform origin-left tracking-tight ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
            {hierarchy.courses.length}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>{stats.coursesCount} with active curricula</span>
            <span className="opacity-0 group-hover:opacity-100 text-blue-500 text-xs font-bold transition-opacity">Courses Table &rarr;</span>
          </div>
        </div>

        {/* Card 3: Total Subjects */}
        <div
          onClick={() => {
            setSelectedSubject('all');
            setSelectedTopic('all');
          }}
          title="Click to reset subject selection"
          className={`admin-stat-card group relative p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(16,185,129,0.22)] hover:border-emerald-500/70 ${surfaceClass}`}
        >
          {/* Ambient Corner Glow on Hover */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-emerald-500/25 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-500 transition-colors">
              Total Subjects
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-500/25 transition-all duration-300 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black mt-2 group-hover:scale-[1.03] transition-transform origin-left tracking-tight ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
            {stats.subjectsCount}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Subject disciplines</span>
            <span className="opacity-0 group-hover:opacity-100 text-emerald-500 text-xs font-bold transition-opacity">Subjects &rarr;</span>
          </div>
        </div>

        {/* Card 4: Total Topics */}
        <div
          onClick={() => setSelectedTopic('all')}
          title="Click to reset topic filter"
          className={`admin-stat-card group relative p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(168,85,247,0.22)] hover:border-purple-500/70 ${surfaceClass}`}
        >
          {/* Ambient Corner Glow on Hover */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-500/25 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-purple-400 transition-colors">
              Total Topics
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:bg-purple-500/25 transition-all duration-300 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-purple-400 group-hover:scale-[1.03] transition-transform origin-left tracking-tight">
            {stats.topicsCount}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>{stats.activeCount} active modules</span>
            <span className="opacity-0 group-hover:opacity-100 text-purple-400 text-xs font-bold transition-opacity">Topics &rarr;</span>
          </div>
        </div>
      </div>

      {/* Cascading Filter Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${surfaceClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#24221e]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Cascading Curriculum Filters
            </span>
          </div>

          {(selectedCourseId !== 'all' || selectedSubject !== 'all' || selectedTopic !== 'all' || searchQuery || statusFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-[#d8b056] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>✕</span>
              Reset All Filters
            </button>
          )}
        </div>

        {/* 3 Cascading Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Course Filter (From Master Courses Table) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">
              1. Select Course (Courses Table)
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseFilterChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">All Master Courses ({hierarchy.courses.length})</option>
              {hierarchy.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.level ? `(${c.level.toUpperCase()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Subject Filter (cascades from selected course) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">
              2. Select Subject
              {selectedCourseObj && (
                <span className="text-[10px] text-[#d8b056] font-normal ml-1">
                  (in {selectedCourseObj.name})
                </span>
              )}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectFilterChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">
                {selectedCourseObj
                  ? `All Subjects in ${selectedCourseObj.name} (${availableSubjectsForFilter.length})`
                  : `All Subjects (${availableSubjectsForFilter.length})`}
              </option>
              {availableSubjectsForFilter.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Topic Filter (cascades from subject) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">
              3. Select Topic
              {selectedSubject !== 'all' && (
                <span className="text-[10px] text-[#d8b056] font-normal ml-1">
                  (in {selectedSubject})
                </span>
              )}
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">
                {selectedSubject !== 'all'
                  ? `All Topics in ${selectedSubject} (${availableTopicsForFilter.length})`
                  : `All Topics (${availableTopicsForFilter.length})`}
              </option>
              {availableTopicsForFilter.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Row: Search Query & Status Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Live Search */}
          <div className="sm:col-span-8 relative">
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
              placeholder="Search by course name, subject, topic, subtopic, or description..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border ${inputClass}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">All Statuses (Active & Inactive)</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={`rounded-3xl border overflow-hidden transition-all duration-300 hover:border-[#d8b056]/30 hover:shadow-md ${surfaceClass}`}>
        <div className="overflow-x-auto min-w-full">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-9 h-9 border-3 border-[#d8b056]/30 border-t-[#d8b056] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-400">Loading course metadata...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-[#d8b056] flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {items.length === 0 ? 'No Course Metadata Yet' : 'No Matching Metadata Found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {items.length === 0
                  ? 'Select an existing course from the courses table and add its subject, topic, and subtopic syllabus.'
                  : 'Try adjusting or clearing your cascading filters above to see more records.'}
              </p>
              {items.length === 0 ? (
                <button
                  onClick={openAddModal}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#d8b056] text-[#0b0b0c] hover:brightness-105 transition cursor-pointer"
                >
                  + Add First Course Metadata
                </button>
              ) : (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold border border-[#d8b056] text-[#d8b056] hover:bg-[#d8b056]/10 transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr
                  className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                    isLight ? 'bg-slate-50/80 text-slate-500 border-slate-100' : 'bg-[#141311] text-slate-400 border-[#24221e]'
                  }`}
                >
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Course (Table)</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Topic</th>
                  <th className="py-3.5 px-4">Subtopic</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1e1c18]'}`}>
                {filteredItems.map((item, index) => {
                  const isToggling = togglingId === item.id;
                  const courseName = item.course?.course_name || item.course_name || `Course #${item.course_id}`;

                  return (
                    <tr
                      key={item.id}
                      className={`text-xs transition-colors duration-150 ${
                        isLight ? 'bg-white' : 'bg-[#100f0e]'
                      }`}
                    >
                      {/* # Index */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Course from courses table */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/courses/curriculum/?course_id=${item.course_id}`}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer group shadow-xs hover:shadow-md hover:scale-[1.02] border ${
                            isLight
                              ? 'bg-[#fbf7ed] hover:bg-[#f5ead0] border-[#d8b056]/70 hover:border-[#c89b3c] shadow-[0_1px_3px_rgba(216,176,86,0.18)]'
                              : 'bg-[#181612] hover:bg-[#231f18] border-[#d8b056]/40 hover:border-[#d8b056]/80 text-[#faf7f0]'
                          }`}
                          title={`Click to open full ${courseName} curriculum breakdown (Subjects -> Topics -> Subtopics)`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                            isLight ? 'bg-[#d8b056]/25 text-[#78510d]' : 'bg-[#d8b056]/20 text-[#eedb9f]'
                          }`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                          </div>
                          <span className={`font-black text-xs tracking-tight ${
                            isLight ? 'text-[#4e3103] group-hover:text-[#2d1b01]' : 'text-[#faf7f0] group-hover:text-[#eedb9f]'
                          }`}>
                            {courseName}
                          </span>
                          {item.course?.level && (
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-black tracking-wider border shadow-xs ${
                              isLight
                                ? 'bg-[#d8b056]/30 text-[#432902] border-[#d8b056]/60'
                                : 'bg-[#d8b056]/20 text-[#eedb9f] border-[#d8b056]/35'
                            }`}>
                              {item.course.level}
                            </span>
                          )}
                          <svg
                            className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 shrink-0 ${
                              isLight ? 'text-[#8a5f11]' : 'text-[#d8b056]'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">
                        {item.subject_id ? (
                          <Link
                            href={`/courses/curriculum/?course_id=${item.course_id}&subject_id=${item.subject_id}`}
                            className="hover:text-[#d8b056] transition inline-flex items-center gap-1 group cursor-pointer"
                            title={`Click to view topics & subtopics of ${item.subject}`}
                          >
                            <span>{item.subject}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#d8b056] transition-opacity">→</span>
                          </Link>
                        ) : (
                          item.subject
                        )}
                      </td>

                      {/* Topic */}
                      <td className="py-3.5 px-4">
                        {item.topic_id ? (
                          <Link
                            href={`/courses/curriculum/?course_id=${item.course_id}&subject_id=${item.subject_id}&topic_id=${item.topic_id}`}
                            className="font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 transition inline-flex items-center gap-1 group cursor-pointer"
                            title={`Click to view subtopics of ${item.topic}`}
                          >
                            <span>{item.topic}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 transition-opacity">→</span>
                          </Link>
                        ) : (
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {item.topic}
                          </span>
                        )}
                      </td>

                      {/* Subtopic */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {item.subtopic}
                        </div>
                        {item.description && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>

                      {/* Status Toggle (Optimistic with Row-level Mini Spinner) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(item)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer disabled:opacity-50 ${
                            item.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20'
                          }`}
                        >
                          {isToggling ? (
                            <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                          )}
                          <span>{item.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Subtopic"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-[#d8b056] hover:border-[#d8b056]/50 transition cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            title="Delete Subtopic"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/50 transition cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* ======================================================== */}
      {/* EXECUTIVE ADD / EDIT MODAL                               */}
      {/* ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${
              isLight
                ? 'bg-white/98 border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900'
                : 'bg-[#100f0e]/98 border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#d8b056]/12 border border-[#d8b056]/28 text-[#d8b056] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                    {editingItem ? 'Edit Curriculum Metadata' : 'Add Course Metadata'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Structure curriculum taxonomy into Course &gt; Subject &gt; Topic &gt; Subtopic.
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

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="mt-6 space-y-4">
              {/* Course Selector (Linked to Master Courses Table) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  1. Course (From Courses Table) <span className="text-rose-500">*</span>
                </label>
                <AdminCustomSelect
                  required
                  value={form.course_id}
                  onChange={(val) => handleModalCourseChange(val)}
                  options={hierarchy.courses}
                  placeholder="-- Choose Master Course --"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Courses are fetched from your existing India Courses master table.
                </p>
              </div>

              {/* Subject (3NF Master: belongs to course_id) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    2. Subject <span className="text-rose-500">*</span>
                  </label>
                  {availableSubjectsForForm.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (form.isNewSubject) {
                          const first = availableSubjectsForForm[0];
                          handleModalSubjectChange(first ? String(first.id) : '');
                        } else {
                          handleModalSubjectChange('__new__');
                        }
                      }}
                      className="text-[10px] font-bold text-[#d8b056] hover:underline cursor-pointer"
                    >
                      {form.isNewSubject ? '← Select Existing Subject' : '+ Type New Subject'}
                    </button>
                  )}
                </div>

                {!form.isNewSubject && availableSubjectsForForm.length > 0 ? (
                  <select
                    value={form.subject_id}
                    onChange={(e) => handleModalSubjectChange(e.target.value)}
                    required
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border ${inputClass}`}
                  >
                    <option value="">-- Choose Existing Subject ({availableSubjectsForForm.length}) --</option>
                    {availableSubjectsForForm.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                    <option value="__new__">+ Create New Subject...</option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value, isNewSubject: true })}
                      placeholder="e.g. Human Anatomy, Data Structures, Financial Management"
                      className={`w-full px-4 py-3 rounded-xl text-xs font-medium border ${inputClass}`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      New subject will be saved into the normalized Subjects table for this course.
                    </p>
                  </div>
                )}
              </div>

              {/* Topic (3NF Master: belongs strictly to subject_id) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    3. Topic <span className="text-rose-500">*</span>
                    {form.subject && (
                      <span className="text-[10px] text-[#d8b056] font-normal ml-1">
                        (in {form.subject})
                      </span>
                    )}
                  </label>
                  {availableTopicsForForm.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (form.isNewTopic) {
                          const first = availableTopicsForForm[0];
                          handleModalTopicChange(first ? String(first.id) : '');
                        } else {
                          handleModalTopicChange('__new__');
                        }
                      }}
                      className="text-[10px] font-bold text-[#d8b056] hover:underline cursor-pointer"
                    >
                      {form.isNewTopic ? '← Select Existing Topic' : '+ Type New Topic'}
                    </button>
                  )}
                </div>

                {!form.isNewTopic && availableTopicsForForm.length > 0 ? (
                  <select
                    value={form.topic_id}
                    onChange={(e) => handleModalTopicChange(e.target.value)}
                    required
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border ${inputClass}`}
                  >
                    <option value="">-- Choose Existing Topic ({availableTopicsForForm.length}) --</option>
                    {availableTopicsForForm.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                    <option value="__new__">+ Create New Topic...</option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value, isNewTopic: true })}
                      placeholder="e.g. Gross Anatomy, Binary Search Trees, Valuation Models"
                      className={`w-full px-4 py-3 rounded-xl text-xs font-medium border ${inputClass}`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      New topic will be linked to Subject &quot;{form.subject || 'selected'}&quot; in the Topics table.
                    </p>
                  </div>
                )}
              </div>

              {/* Subtopic (3NF Master: belongs strictly to topic_id) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    4. Subtopic <span className="text-rose-500">*</span>
                    {form.topic && (
                      <span className="text-[10px] text-[#d8b056] font-normal ml-1">
                        (in {form.topic})
                      </span>
                    )}
                  </label>
                  {availableSubtopicsForForm.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (form.isNewSubtopic) {
                          const first = availableSubtopicsForForm[0];
                          setForm((prev) => ({
                            ...prev,
                            subtopic_id: first ? String(first.id) : '',
                            subtopic: first ? first.name : '',
                            isNewSubtopic: false,
                          }));
                        } else {
                          setForm((prev) => ({
                            ...prev,
                            subtopic_id: '',
                            subtopic: '',
                            isNewSubtopic: true,
                          }));
                        }
                      }}
                      className="text-[10px] font-bold text-[#d8b056] hover:underline cursor-pointer"
                    >
                      {form.isNewSubtopic ? '← Select Existing Subtopic' : '+ Type New Subtopic'}
                    </button>
                  )}
                </div>

                {!form.isNewSubtopic && availableSubtopicsForForm.length > 0 ? (
                  <select
                    value={form.subtopic_id || (availableSubtopicsForForm.find((st) => st.name === form.subtopic)?.id ? String(availableSubtopicsForForm.find((st) => st.name === form.subtopic).id) : '')}
                    onChange={(e) => {
                      const stid = e.target.value;
                      if (stid === '__new__') {
                        setForm((prev) => ({ ...prev, subtopic_id: '', subtopic: '', isNewSubtopic: true }));
                        return;
                      }
                      const found = availableSubtopicsForForm.find((st) => String(st.id) === String(stid));
                      setForm((prev) => ({
                        ...prev,
                        subtopic_id: stid,
                        subtopic: found ? found.name : prev.subtopic,
                        isNewSubtopic: false,
                      }));
                    }}
                    required
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border ${inputClass}`}
                  >
                    <option value="">-- Choose Existing Subtopic ({availableSubtopicsForForm.length}) --</option>
                    {availableSubtopicsForForm.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                    <option value="__new__">+ Create New Subtopic...</option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      value={form.subtopic}
                      onChange={(e) => setForm({ ...form, subtopic: e.target.value, isNewSubtopic: true })}
                      placeholder="e.g. Upper Limb Innervation & Muscle Groups"
                      className={`w-full px-4 py-3 rounded-xl text-xs font-medium border ${inputClass}`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      New subtopic will be linked to Topic &quot;{form.topic || 'selected'}&quot; in the Subtopics table.
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Description / Syllabus Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Key concepts, lab practicals, reference textbook chapters, or exam notes..."
                  className={`w-full px-4 py-3 rounded-xl text-xs font-medium border resize-none ${inputClass}`}
                />
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border ${inputClass}`}
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-start sm:gap-4 self-end pb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Active Status:
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      form.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-slate-400">
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#0b0b0c] border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Metadata' : 'Save Metadata'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL                                */}
      {/* ======================================================== */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 ${
              isLight
                ? 'bg-white/98 border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900'
                : 'bg-[#100f0e]/98 border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-rose-500">
                  Delete Metadata Subtopic
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to delete this curriculum record?
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-500/10 border border-slate-500/15 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                {itemToDelete.subtopic}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {itemToDelete.course?.course_name || itemToDelete.course_name} &bull; {itemToDelete.subject} &bull; {itemToDelete.topic}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
