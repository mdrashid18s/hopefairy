'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  getAdminResources,
  getAdminResourceStats,
  createAdminResource,
  updateAdminResource,
  toggleAdminResource,
  toggleAdminResourceFeatured,
  deleteAdminResource,
  getAdminMetadataHierarchy,
  getAdminMetadata,
  getAdminCourses,
} from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';
import AdminCustomSelect from '../AdminCustomSelect.js';

export default function AdminResourcesPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  // Master data states
  const [items, setItems] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [hierarchy, setHierarchy] = useState({ courses: [], subjectsByCourse: {}, topicsBySubject: {} });
  const [coursesList, setCoursesList] = useState([]);
  const [metadataList, setMetadataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Cascading Filters (Course -> Subject -> Topic -> Price -> Search)
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all'); // 'all' | 'free' | 'paid'
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Row-level mutation tracking
  const [togglingId, setTogglingId] = useState(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form State for Add / Edit Modal (3NF Architecture)
  const initialForm = {
    course_id: '',
    course_metadata_id: '',
    subject_id: '',
    subject: '',
    isNewSubject: false,
    topic_id: '',
    topic: '',
    isNewTopic: false,
    subtopic_id: '',
    subtopic: '',
    isNewSubtopic: false,
    title: '',
    slug: '',
    short_description: '',
    description: '',
    material_type: 'Study Notes',
    badge: 'Bestseller',
    author_name: 'HopeFairy Academic Faculty',
    page_count: 75,
    is_free: false,
    actual_price: 699,
    sell_price: 249,
    currency: 'INR',
    is_featured: false,
    is_active: true,
    display_order: 1,
  };

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');

  // File uploads in modal
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedThumb, setSelectedThumb] = useState(null);
  const [selectedPreviewPdf, setSelectedPreviewPdf] = useState(null);
  const [removeExistingThumb, setRemoveExistingThumb] = useState(false);
  const [removeExistingPreview, setRemoveExistingPreview] = useState(false);

  const [pdfDragOver, setPdfDragOver] = useState(false);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const pdfInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const previewPdfInputRef = useRef(null);

  // Flash Feedback Banner
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: 'success' });
  const showFeedback = useCallback((text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: 'success' }), 4000);
  }, []);

  // Direct Table-Row PDF Upload State & Handlers
  const [uploadingPdfId, setUploadingPdfId] = useState(null);
  const rowPdfInputRef = useRef(null);
  const [targetRowForPdf, setTargetRowForPdf] = useState(null);

  const triggerRowPdfUpload = (resourceId) => {
    setTargetRowForPdf(resourceId);
    if (rowPdfInputRef.current) {
      rowPdfInputRef.current.value = '';
      rowPdfInputRef.current.click();
    }
  };

  const handleRowPdfSelected = async (e) => {
    const file = e.target.files?.[0];
    const rowId = targetRowForPdf;
    if (!file || !rowId) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showFeedback('Please select a valid PDF file.', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showFeedback('PDF file size cannot exceed 50MB.', 'error');
      return;
    }

    const targetItem = items.find((it) => it.id === rowId);
    if (!targetItem) return;

    try {
      setUploadingPdfId(rowId);

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('course_id', targetItem.course_id);
      formData.append('title', targetItem.title);

      const updatedRes = await updateAdminResource(targetItem.id, formData);
      const updatedData = updatedRes?.data || updatedRes;

      setItems((prev) =>
        prev.map((it) => (it.id === rowId ? { ...it, ...updatedData } : it))
      );

      showFeedback(`PDF "${file.name}" uploaded successfully for "${targetItem.title}".`);
    } catch (err) {
      showFeedback(err.message || 'Failed to upload PDF.', 'error');
    } finally {
      setUploadingPdfId(null);
      setTargetRowForPdf(null);
    }
  };

  // Fetch initial data
  const fetchData = useCallback(async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      setError('');

      const [resourcesRes, statsRes, hierarchyRes, coursesRes, metadataRes] = await Promise.all([
        getAdminResources().catch(() => []),
        getAdminResourceStats().catch(() => null),
        getAdminMetadataHierarchy().catch(() => ({ courses: [], subjectsByCourse: {}, topicsBySubject: {} })),
        getAdminCourses().catch(() => []),
        getAdminMetadata().catch(() => []),
      ]);

      const list = Array.isArray(resourcesRes)
        ? resourcesRes
        : Array.isArray(resourcesRes?.data)
        ? resourcesRes.data
        : [];

      setItems(list);
      setStatsData(statsRes?.data || statsRes || null);

      const hData = hierarchyRes?.courses
        ? hierarchyRes
        : hierarchyRes?.data || {};
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

      // Master courses list: fallback to coursesRes if hierarchy.courses is smaller
      const rawC = coursesRes?.data || coursesRes || [];
      const cArray = Array.isArray(rawC) && rawC.length > 0
        ? rawC.map((c) => ({ id: c.id, name: c.course_name || c.name, level: c.level }))
        : (hData.courses || []);
      setCoursesList(cArray);

      const mList = Array.isArray(metadataRes)
        ? metadataRes
        : Array.isArray(metadataRes?.data)
        ? metadataRes.data
        : [];
      setMetadataList(mList);
    } catch (err) {
      setError(err.message || 'Failed to load study materials.');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Derived available subjects for filter (Strict 3NF from hierarchy + existing records)
  const availableSubjectsForFilter = useMemo(() => {
    if (selectedCourseId === 'all') {
      const allSubs = new Set();
      (hierarchy.subjects || []).forEach((s) => allSubs.add(s.name));
      items.forEach((it) => {
        if (it.subject) allSubs.add(it.subject);
      });
      metadataList.forEach((m) => {
        if (m.subject) allSubs.add(m.subject);
      });
      return Array.from(allSubs).sort();
    }
    const relSubs = hierarchy.relationalSubjectsByCourse?.[selectedCourseId] || [];
    if (relSubs.length > 0) {
      return relSubs.map((s) => s.name).sort();
    }
    const set = new Set();
    items.filter((it) => String(it.course_id) === String(selectedCourseId)).forEach((it) => {
      if (it.subject) set.add(it.subject);
    });
    metadataList.filter((m) => String(m.course_id) === String(selectedCourseId)).forEach((m) => {
      if (m.subject) set.add(m.subject);
    });
    return Array.from(set).sort();
  }, [selectedCourseId, hierarchy, items, metadataList]);

  // Derived available topics for filter (Strict 3NF from subject)
  const availableTopicsForFilter = useMemo(() => {
    if (selectedSubject !== 'all') {
      const subObj = hierarchy.subjects?.find((s) => s.name === selectedSubject);
      if (subObj && hierarchy.relationalTopicsBySubject?.[subObj.id]) {
        return hierarchy.relationalTopicsBySubject[subObj.id].map((t) => t.name).sort();
      }
    }
    const set = new Set();
    items.forEach((it) => {
      const matchCourse = selectedCourseId === 'all' || String(it.course_id) === String(selectedCourseId);
      const matchSub = selectedSubject === 'all' || it.subject === selectedSubject;
      if (matchCourse && matchSub && it.topic) set.add(it.topic);
    });
    metadataList.forEach((m) => {
      const matchCourse = selectedCourseId === 'all' || String(m.course_id) === String(selectedCourseId);
      const matchSub = selectedSubject === 'all' || m.subject === selectedSubject;
      if (matchCourse && matchSub && m.topic) set.add(m.topic);
    });
    return Array.from(set).sort();
  }, [selectedCourseId, selectedSubject, hierarchy, items, metadataList]);

  // Available subjects for the modal based on form.course_id
  const availableSubjectsForForm = useMemo(() => {
    if (!form.course_id) return [];
    let list = hierarchy.relationalSubjectsByCourse?.[String(form.course_id)] || [];
    if (list.length === 0 && Array.isArray(hierarchy.subjects)) {
      list = hierarchy.subjects.filter((s) => String(s.course_id) === String(form.course_id));
    }
    return list;
  }, [form.course_id, hierarchy.relationalSubjectsByCourse, hierarchy.subjects]);

  // Available topics for the modal based on form.subject_id
  const availableTopicsForForm = useMemo(() => {
    let list = [];
    if (form.subject_id) {
      list = hierarchy.relationalTopicsBySubject?.[String(form.subject_id)] || [];
      if (list.length === 0 && Array.isArray(hierarchy.topics)) {
        list = hierarchy.topics.filter((t) => String(t.subject_id) === String(form.subject_id));
      }
    }
    if (list.length === 0 && form.subject && Array.isArray(hierarchy.subjects)) {
      const sObj = hierarchy.subjects.find(
        (s) => s.name?.toLowerCase().trim() === form.subject?.toLowerCase().trim()
      );
      if (sObj) {
        list = hierarchy.relationalTopicsBySubject?.[String(sObj.id)] || [];
        if (list.length === 0 && Array.isArray(hierarchy.topics)) {
          list = hierarchy.topics.filter((t) => String(t.subject_id) === String(sObj.id));
        }
      }
    }
    return list;
  }, [form.subject_id, form.subject, hierarchy.relationalTopicsBySubject, hierarchy.topics, hierarchy.subjects]);

  // Available subtopics for the modal based on form.topic_id
  const availableSubtopicsForForm = useMemo(() => {
    let list = [];
    if (form.topic_id) {
      list = hierarchy.relationalSubtopicsByTopic?.[String(form.topic_id)] || [];
      if (list.length === 0 && Array.isArray(hierarchy.subtopics)) {
        list = hierarchy.subtopics.filter((st) => String(st.topic_id) === String(form.topic_id));
      }
    }
    if (list.length === 0 && form.topic && Array.isArray(hierarchy.topics)) {
      const tObj = hierarchy.topics.find(
        (t) => t.name?.toLowerCase().trim() === form.topic?.toLowerCase().trim()
      );
      if (tObj) {
        list = hierarchy.relationalSubtopicsByTopic?.[String(tObj.id)] || [];
        if (list.length === 0 && Array.isArray(hierarchy.subtopics)) {
          list = hierarchy.subtopics.filter((st) => String(st.topic_id) === String(tObj.id));
        }
      }
    }
    return list;
  }, [form.topic_id, form.topic, hierarchy.relationalSubtopicsByTopic, hierarchy.subtopics, hierarchy.topics]);

  // Derived metadata options for Add/Edit Modal (filtered by chosen course)
  const metadataOptionsForForm = useMemo(() => {
    if (!form.course_id) return metadataList;
    return metadataList.filter((m) => String(m.course_id) === String(form.course_id));
  }, [form.course_id, metadataList]);

  // Real-time live discount calculation for modal
  const liveDiscount = useMemo(() => {
    if (form.is_free) {
      return { percent: 100, savings: Number(form.actual_price) || 0, isFree: true, isValid: true };
    }
    const actual = parseFloat(form.actual_price) || 0;
    const sell = parseFloat(form.sell_price) || 0;
    if (actual <= 0) {
      return { percent: 0, savings: 0, isFree: false, isValid: true };
    }
    if (sell > actual) {
      return { percent: 0, savings: 0, isFree: false, isValid: false, warning: 'Selling price cannot exceed MRP' };
    }
    const savings = actual - sell;
    const percent = Math.round((savings / actual) * 100);
    return { percent, savings, isFree: false, isValid: true };
  }, [form.is_free, form.actual_price, form.sell_price]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Course
      if (selectedCourseId !== 'all' && String(item.course_id) !== String(selectedCourseId)) {
        return false;
      }
      // Subject
      if (selectedSubject !== 'all' && item.subject !== selectedSubject) {
        return false;
      }
      // Topic
      if (selectedTopic !== 'all' && item.topic !== selectedTopic) {
        return false;
      }
      // Price
      if (priceFilter === 'free' && !item.is_free) return false;
      if (priceFilter === 'paid' && item.is_free) return false;
      // Type
      if (typeFilter !== 'all' && item.material_type !== typeFilter) return false;
      // Status
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active';
        if (Boolean(item.is_active) !== isActive) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inCourse = (item.course?.course_name || item.course_name || '').toLowerCase().includes(q);
        const inSubject = item.subject?.toLowerCase().includes(q);
        const inTopic = item.topic?.toLowerCase().includes(q);
        const inSubtopic = item.subtopic?.toLowerCase().includes(q);
        const inAuthor = item.author_name?.toLowerCase().includes(q);
        const inDesc = item.short_description?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
        if (!inTitle && !inCourse && !inSubject && !inTopic && !inSubtopic && !inAuthor && !inDesc) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCourseId, selectedSubject, selectedTopic, priceFilter, typeFilter, statusFilter, searchQuery]);

  // KPI Stats
  const stats = useMemo(() => {
    const total = items.length;
    const freeCount = items.filter((i) => Boolean(i.is_free)).length;
    const paidCount = items.filter((i) => !i.is_free).length;
    const totalDownloads = items.reduce((acc, i) => acc + (parseInt(i.download_count, 10) || 0), 0);
    const catalogValue = items.reduce((acc, i) => acc + (parseFloat(i.sell_price) || 0), 0);
    const coursesCount = new Set(items.map((i) => i.course_id).filter(Boolean)).size || coursesList.length;
    const metadataCount = metadataList.length || total;
    return {
      total: statsData?.total_resources ?? total,
      freeCount: statsData?.free_resources ?? freeCount,
      paidCount: statsData?.paid_resources ?? paidCount,
      totalDownloads: statsData?.total_downloads ?? totalDownloads,
      catalogValue: statsData?.catalog_value ?? catalogValue,
      coursesCount,
      metadataCount,
    };
  }, [items, statsData, coursesList, metadataList]);

  // Reset Filters
  const resetFilters = () => {
    setSelectedCourseId('all');
    setSelectedSubject('all');
    setSelectedTopic('all');
    setPriceFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Handlers for Add / Edit Modal (3NF Architecture)
  const openAddModal = () => {
    setEditingItem(null);
    setSelectedPdf(null);
    setSelectedThumb(null);
    setSelectedPreviewPdf(null);
    setRemoveExistingThumb(false);
    setRemoveExistingPreview(false);
    setFormError('');

    const defaultCourseId = selectedCourseId !== 'all' ? selectedCourseId : (coursesList[0]?.id || hierarchy.courses[0]?.id || '');
    const subjectsForC = defaultCourseId ? (hierarchy.relationalSubjectsByCourse?.[String(defaultCourseId)] || []) : [];
    const firstSubject = subjectsForC[0];
    const topicsForS = firstSubject ? (hierarchy.relationalTopicsBySubject?.[String(firstSubject.id)] || []) : [];
    const firstTopic = topicsForS[0];
    const subtopicsForT = firstTopic
      ? (hierarchy.relationalSubtopicsByTopic?.[String(firstTopic.id)] ||
         (Array.isArray(hierarchy.subtopics) ? hierarchy.subtopics.filter((st) => String(st.topic_id) === String(firstTopic.id)) : []))
      : [];
    const firstSubtopic = subtopicsForT[0];

    setForm({
      ...initialForm,
      course_id: defaultCourseId ? String(defaultCourseId) : '',
      subject_id: firstSubject ? String(firstSubject.id) : '',
      subject: firstSubject ? firstSubject.name : '',
      isNewSubject: subjectsForC.length === 0,
      topic_id: firstTopic ? String(firstTopic.id) : '',
      topic: firstTopic ? firstTopic.name : '',
      isNewTopic: topicsForS.length === 0,
      subtopic_id: firstSubtopic ? String(firstSubtopic.id) : '',
      subtopic: firstSubtopic ? firstSubtopic.name : '',
      isNewSubtopic: subtopicsForT.length === 0,
      title: firstSubtopic ? `${firstSubtopic.name} — Complete Illustrated Notes` : '',
      display_order: items.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setSelectedPdf(null);
    setSelectedThumb(null);
    setSelectedPreviewPdf(null);
    setRemoveExistingThumb(false);
    setRemoveExistingPreview(false);
    setFormError('');
    setForm({
      course_id: item.course_id ? String(item.course_id) : '',
      course_metadata_id: item.course_metadata_id || item.metadata_id ? String(item.course_metadata_id || item.metadata_id) : '',
      subject_id: item.subject_id ? String(item.subject_id) : '',
      subject: item.subject || '',
      isNewSubject: !item.subject_id,
      topic_id: item.topic_id ? String(item.topic_id) : '',
      topic: item.topic || '',
      isNewTopic: !item.topic_id,
      subtopic_id: item.subtopic_id ? String(item.subtopic_id) : '',
      subtopic: item.subtopic || '',
      isNewSubtopic: !item.subtopic_id,
      title: item.title || '',
      slug: item.slug || '',
      short_description: item.short_description || '',
      description: item.description || '',
      material_type: item.material_type || 'Study Notes',
      badge: item.badge || '',
      author_name: item.author_name || '',
      page_count: item.page_count ?? 0,
      is_free: Boolean(item.is_free),
      actual_price: item.actual_price ?? 0,
      sell_price: item.sell_price ?? 0,
      currency: item.currency || 'INR',
      is_featured: Boolean(item.is_featured),
      is_active: Boolean(item.is_active),
      display_order: item.display_order ?? 1,
    });
    setModalOpen(true);
  };

  // Handle Metadata selection in modal
  const handleMetadataSelectInForm = (metadataId) => {
    if (!metadataId) {
      setForm((prev) => ({
        ...prev,
        course_metadata_id: '',
      }));
      return;
    }
    const meta = metadataList.find((m) => String(m.id) === String(metadataId));
    if (meta) {
      setForm((prev) => ({
        ...prev,
        course_metadata_id: String(meta.id),
        course_id: meta.course_id ? String(meta.course_id) : prev.course_id,
        subject_id: meta.subject_id ? String(meta.subject_id) : '',
        subject: meta.subject || prev.subject,
        isNewSubject: false,
        topic_id: meta.topic_id ? String(meta.topic_id) : '',
        topic: meta.topic || prev.topic,
        isNewTopic: false,
        subtopic_id: meta.subtopic_id ? String(meta.subtopic_id) : '',
        subtopic: meta.subtopic || prev.subtopic,
        isNewSubtopic: false,
        title: prev.title || `${meta.subtopic} — Complete Illustrated Notes`,
      }));
    }
  };

  // Submit Add / Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.course_id) {
      setFormError('Please select a Master Course.');
      return;
    }
    if (!form.title.trim()) {
      setFormError('Material Title is required.');
      return;
    }
    if (!editingItem && !selectedPdf) {
      setFormError('Please upload the primary Study Material PDF document.');
      return;
    }
    if (!form.is_free && parseFloat(form.sell_price) > parseFloat(form.actual_price)) {
      setFormError('Selling price cannot exceed the original MRP.');
      return;
    }

    try {
      setActionLoading(true);

      const formData = new FormData();
      formData.append('course_id', form.course_id);
      if (form.course_metadata_id) {
        formData.append('course_metadata_id', form.course_metadata_id);
        formData.append('metadata_id', form.course_metadata_id);
      }
      if (form.subject_id && !form.isNewSubject) formData.append('subject_id', form.subject_id);
      if (form.topic_id && !form.isNewTopic) formData.append('topic_id', form.topic_id);
      if (form.subtopic_id) formData.append('subtopic_id', form.subtopic_id);
      if (form.subject) formData.append('subject', form.subject.trim());
      if (form.topic) formData.append('topic', form.topic.trim());
      if (form.subtopic) formData.append('subtopic', form.subtopic.trim());
      formData.append('title', form.title.trim());
      if (form.slug) formData.append('slug', form.slug.trim());
      if (form.short_description) formData.append('short_description', form.short_description.trim());
      if (form.description) formData.append('description', form.description.trim());
      formData.append('material_type', form.material_type);
      if (form.badge) formData.append('badge', form.badge);
      if (form.author_name) formData.append('author_name', form.author_name.trim());
      formData.append('page_count', form.page_count || 0);

      formData.append('is_free', form.is_free ? '1' : '0');
      formData.append('actual_price', form.is_free ? '0' : (form.actual_price || 0));
      formData.append('sell_price', form.is_free ? '0' : (form.sell_price || 0));
      formData.append('currency', form.currency || 'INR');

      formData.append('is_featured', form.is_featured ? '1' : '0');
      formData.append('is_active', form.is_active ? '1' : '0');
      formData.append('display_order', form.display_order || 1);

      // Files
      if (selectedPdf) {
        formData.append('pdf', selectedPdf);
      }
      if (selectedThumb) {
        formData.append('thumbnail_file', selectedThumb);
      }
      if (selectedPreviewPdf) {
        formData.append('preview_pdf_file', selectedPreviewPdf);
      }
      if (removeExistingThumb) {
        formData.append('remove_thumbnail', '1');
      }
      if (removeExistingPreview) {
        formData.append('remove_preview_pdf', '1');
      }

      if (editingItem) {
        const updated = await updateAdminResource(editingItem.id, formData);
        const resolved = updated?.data || updated;
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? { ...i, ...resolved } : i)));
        showFeedback(`Study material "${resolved.title || form.title}" updated successfully.`);
      } else {
        const created = await createAdminResource(formData);
        const resolved = created?.data || created;
        setItems((prev) => [resolved, ...prev]);
        showFeedback(`New study material "${resolved.title || form.title}" added to store.`);
      }

      setModalOpen(false);
      getAdminResourceStats().then((s) => setStatsData(s?.data || s || null)).catch(() => {});
    } catch (err) {
      setFormError(err.message || 'Operation failed. Please verify form details.');
    } finally {
      setActionLoading(false);
    }
  };

  // Optimistic Row Toggle Active
  const handleToggle = async (item) => {
    const oldStatus = item.is_active;
    const newStatus = !oldStatus;

    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: newStatus } : i)));
    setTogglingId(item.id);

    try {
      await toggleAdminResource(item.id);
    } catch (err) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: oldStatus } : i)));
      showFeedback(err.message || 'Failed to toggle status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading(true);
      await deleteAdminResource(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      showFeedback(`Study material "${itemToDelete.title}" deleted.`);
      getAdminResourceStats().then((s) => setStatsData(s?.data || s || null)).catch(() => {});
    } catch (err) {
      showFeedback(err.message || 'Failed to delete resource.', 'error');
    } finally {
      setActionLoading(false);
      setItemToDelete(null);
    }
  };

  // Theme styling tokens (Matching metadata/page.js exactly)
  const surfaceClass = isLight
    ? 'bg-white border-slate-100 shadow-[0_10px_30px_-4px_rgba(15,23,42,0.05)] text-slate-800'
    : 'bg-[#100f0e] border-[#24221e] shadow-[0_10px_30px_-4px_rgba(0,0,0,0.5)] text-slate-100';

  const inputClass = isLight
    ? 'bg-white border-slate-200 text-slate-800 focus:border-[#d8b056] focus:ring-[#d8b056]/20'
    : 'bg-[#141311] border-[#2a2824] text-slate-100 focus:border-[#d8b056] focus:ring-[#d8b056]/20';

  return (
    <div className="space-y-6">
      {/* Flash Banner */}
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

      {/* Header (Exact Typography & Styling as Metadata) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d8b056]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056]">
              Curriculum Metadata &amp; Study Materials Store
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight mt-1 ${isLight ? 'text-slate-900' : 'text-[#faf7f0]'}`}>
            Resources &amp; Study Materials Store
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            All curriculum metadata (Courses &rarr; Subject &rarr; Topic &rarr; Subtopic) with downloadable study PDFs, prices, and live discount calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/metadata"
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
              isLight
                ? 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                : 'border-[#24221e] text-slate-300 bg-[#141311] hover:bg-[#1a1916]'
            }`}
          >
            <svg className="w-4 h-4 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>&larr; Manage Metadata</span>
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
            <span>Add Study Material</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Interactive with Luxury Hover Effects & Standard Prominent Typography) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Total Study Materials */}
        <div
          onClick={resetFilters}
          title="Click to view all study materials"
          className={`admin-stat-card group relative p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(216,176,86,0.22)] hover:border-[#d8b056]/80 ${surfaceClass}`}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-[#d8b056]/25 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#d8b056] transition-colors">
              Total Resources
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#d8b056]/10 text-[#d8b056] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#d8b056]/25 transition-all duration-300 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-[#d8b056] group-hover:scale-[1.03] transition-transform origin-left tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Syllabus breakdown materials</span>
            <span className="opacity-0 group-hover:opacity-100 text-[#d8b056] text-xs font-bold transition-opacity">View all &rarr;</span>
          </div>
        </div>

        {/* Card 2: Master Courses (Identical to Metadata Page) */}
        <div
          onClick={() => {
            setSelectedCourseId('all');
            setSelectedSubject('all');
            setSelectedTopic('all');
          }}
          title="Click to reset course selection"
          className={`admin-stat-card group relative p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(59,130,246,0.22)] hover:border-blue-500/70 ${surfaceClass}`}
        >
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
            {coursesList.length || hierarchy.courses.length}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>{stats.coursesCount} active course streams</span>
            <span className="opacity-0 group-hover:opacity-100 text-blue-500 text-xs font-bold transition-opacity">Courses Table &rarr;</span>
          </div>
        </div>

        {/* Card 3: Free Study Materials */}
        <div
          onClick={() => setPriceFilter((prev) => (prev === 'free' ? 'all' : 'free'))}
          title="Click to filter by Free Materials"
          className={`admin-stat-card group relative p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(16,185,129,0.22)] hover:border-emerald-500/70 ${surfaceClass}`}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-emerald-500/25 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-500 transition-colors">
              Free Materials
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-500/25 transition-all duration-300 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-emerald-500 group-hover:scale-[1.03] transition-transform origin-left tracking-tight">
            {stats.freeCount}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>₹0 Free Access for Students</span>
            <span className="opacity-0 group-hover:opacity-100 text-emerald-500 text-xs font-bold transition-opacity">Free Only &rarr;</span>
          </div>
        </div>

        {/* Card 4: Premium Paid Products */}
        <div
          onClick={() => setPriceFilter((prev) => (prev === 'paid' ? 'all' : 'paid'))}
          title="Click to filter by Paid Products"
          className={`admin-stat-card group relative p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(168,85,247,0.22)] hover:border-purple-500/70 ${surfaceClass}`}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-500/25 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-purple-400 transition-colors">
              Premium Products
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:bg-purple-500/25 transition-all duration-300 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-purple-400 group-hover:scale-[1.03] transition-transform origin-left tracking-tight">
            {stats.paidCount}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>₹{Math.round(stats.catalogValue).toLocaleString()} Catalog Value</span>
            <span className="opacity-0 group-hover:opacity-100 text-purple-400 text-xs font-bold transition-opacity">Paid Only &rarr;</span>
          </div>
        </div>
      </div>

      {/* Cascading Filter Bar (Exact same layout & typography as Metadata Page) */}
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

          {(selectedCourseId !== 'all' || selectedSubject !== 'all' || selectedTopic !== 'all' || priceFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-[#d8b056] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>✕</span>
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* 1. Course Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
              1. Select Course (Courses Table)
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedSubject('all');
                setSelectedTopic('all');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">All Master Courses ({coursesList.length || hierarchy.courses.length})</option>
              {coursesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.level ? `(${c.level.toUpperCase()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Subject Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
              2. Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopic('all');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">All Subjects ({availableSubjectsForFilter.length})</option>
              {availableSubjectsForFilter.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Topic Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
              3. Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">All Topics ({availableTopicsForFilter.length})</option>
              {availableTopicsForFilter.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Pricing Tier */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-300">
              4. Pricing Tier
            </label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">All Tiers (Free &amp; Paid)</option>
              <option value="free">Free Only (₹0)</option>
              <option value="paid">Premium Paid (Discounted)</option>
            </select>
          </div>
        </div>

        {/* Live Search & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
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
              placeholder="Search by course name, subject, topic, subtopic, author, or title..."
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

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${inputClass}`}
            >
              <option value="all">All Statuses (Active &amp; Inactive)</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card (Exact same font and layout as Metadata table) */}
      <div className={`rounded-3xl border overflow-hidden transition-all duration-300 hover:border-[#d8b056]/30 hover:shadow-md ${surfaceClass}`}>
        <div className="overflow-x-auto min-w-full">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-9 h-9 border-3 border-[#d8b056]/30 border-t-[#d8b056] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-400">Loading course metadata &amp; study materials...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#d8b056]/10 text-[#d8b056] flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {items.length === 0 ? 'No Study Materials Yet' : 'No Matching Resources Found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {items.length === 0
                  ? 'All metadata records will automatically be linked and displayed here.'
                  : 'Try adjusting your filters or search term above to locate the record.'}
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold border border-[#d8b056] text-[#d8b056] hover:bg-[#d8b056]/10 transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1100px]">
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
                  <th className="py-3.5 px-4">Study Material / Product</th>
                  <th className="py-3.5 px-4">Price &amp; Discount</th>
                  <th className="py-3.5 px-4 text-center">PDF Material</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1e1c18]'}`}>
                {filteredItems.map((item, index) => {
                  const isToggling = togglingId === item.id;
                  const courseName = item.course?.course_name || item.course_name || `Course #${item.course_id}`;

                  return (
                    <tr
                      key={item.id}
                      className={`text-xs transition-colors duration-150 ${isLight ? 'bg-white' : 'bg-[#100f0e]'}`}
                    >
                      {/* # Index */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/courses/curriculum/?course_id=${item.course_id || item.course?.id}`}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer group shadow-xs hover:shadow-md hover:scale-[1.02] border ${
                            isLight
                              ? 'bg-[#fbf7ed] hover:bg-[#f5ead0] border-[#d8b056]/70 hover:border-[#c89b3c] shadow-[0_1px_3px_rgba(216,176,86,0.18)]'
                              : 'bg-[#181612] hover:bg-[#231f18] border-[#d8b056]/40 hover:border-[#d8b056]/80 text-[#faf7f0]'
                          }`}
                          title={`Click to open full ${courseName} curriculum breakdown`}
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
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {item.subtopic || item.topic}
                        </div>
                        {item.short_description && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.short_description}
                          </div>
                        )}
                      </td>

                      {/* Study Material / Product Info */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="flex items-start gap-2.5">
                          {/* Book cover / icon */}
                          <div className="w-9 h-11 rounded-lg bg-gradient-to-br from-[#eedb9f]/30 via-[#d8b056]/20 to-[#c89b3c]/30 border border-[#d8b056]/40 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail_url || item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-4 h-4 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                              <span className="truncate max-w-[200px]">{item.title}</span>
                              {item.badge && (
                                <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-[#d8b056] text-[#0b0b0c]">
                                  {item.badge}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                                {item.material_type || 'Study Notes'}
                              </span>
                              {item.author_name && (
                                <span className="truncate max-w-[110px]">By {item.author_name}</span>
                              )}
                              {item.page_count > 0 && (
                                <span>&bull; {item.page_count}p</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pricing & Discount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.is_free ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            FREE (₹0)
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-black text-[#d8b056]">
                                ₹{item.sell_price}
                              </span>
                              {item.actual_price > item.sell_price && (
                                <span className="text-[11px] line-through text-slate-400 font-medium">
                                  ₹{item.actual_price}
                                </span>
                              )}
                            </div>
                            {item.discount_percent > 0 && (
                              <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                <span>{item.discount_percent}% OFF</span>
                                {item.actual_price > item.sell_price && (
                                  <span className="font-normal opacity-80">
                                    (Save ₹{Math.round(item.actual_price - item.sell_price)})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* PDF Material */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {uploadingPdfId === item.id ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#d8b056]/15 text-[#d8b056] border border-[#d8b056]/30 animate-pulse">
                            <span className="w-3.5 h-3.5 border-2 border-[#d8b056] border-t-transparent rounded-full animate-spin" />
                            <span>Uploading PDF...</span>
                          </div>
                        ) : item.pdf_file && !item.pdf_file.startsWith('sample_') ? (
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={item.pdf_url || `/storage/${item.pdf_file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 hover:bg-purple-500/20 transition cursor-pointer"
                              title="Click to view/download PDF"
                            >
                              <svg className="w-3.5 h-3.5 shrink-0 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span>PDF</span>
                              {item.file_size && (
                                <span className="text-[9px] text-slate-400 font-mono">
                                  ({item.file_size})
                                </span>
                              )}
                            </a>
                            <button
                              type="button"
                              onClick={() => triggerRowPdfUpload(item.id)}
                              title="Re-upload / Replace PDF file"
                              className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-[#d8b056] hover:border-[#d8b056]/50 transition cursor-pointer"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => triggerRowPdfUpload(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-dashed border-[#d8b056]/60 bg-[#d8b056]/10 text-[#d8b056] hover:bg-[#d8b056]/20 hover:border-[#d8b056] active:scale-[0.98] transition cursor-pointer shadow-xs"
                            title="Click to select and upload real PDF"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>+ Upload PDF</span>
                          </button>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Study Material"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-[#d8b056] hover:border-[#d8b056]/50 transition cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            title="Delete Study Material"
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
            className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                    {editingItem ? 'Edit Study Material Product' : 'Add New Study Material'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure curriculum link, PDF attachment, pricing, and live discount calculations.
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

            <form onSubmit={handleSubmitForm} className="mt-6 space-y-5">
              {/* SECTION 1: Master Course & Metadata Linkage */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141311] border border-slate-200 dark:border-[#24221e] space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056] flex items-center justify-between">
                  <span>1. Curriculum &amp; Metadata Link</span>
                  {form.course_metadata_id && (
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Linked to Metadata #{form.course_metadata_id}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Master Course */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                      Master Course <span className="text-rose-500">*</span>
                    </label>
                    <AdminCustomSelect
                      required
                      value={form.course_id}
                      onChange={(newC) => {
                        const subs = newC ? (hierarchy.relationalSubjectsByCourse?.[String(newC)] || []) : [];
                        const firstS = subs[0];
                        const topics = firstS ? (hierarchy.relationalTopicsBySubject?.[String(firstS.id)] || []) : [];
                        const firstT = topics[0];
                        let subtopics = firstT ? (hierarchy.relationalSubtopicsByTopic?.[String(firstT.id)] || []) : [];
                        if (subtopics.length === 0 && Array.isArray(hierarchy.subtopics) && firstT) {
                          subtopics = hierarchy.subtopics.filter((st) => String(st.topic_id) === String(firstT.id));
                        }
                        const firstSt = subtopics[0];
                        setForm((prev) => ({
                          ...prev,
                          course_id: newC,
                          course_metadata_id: '',
                          subject_id: firstS ? String(firstS.id) : '',
                          subject: firstS ? firstS.name : '',
                          isNewSubject: subs.length === 0,
                          topic_id: firstT ? String(firstT.id) : '',
                          topic: firstT ? firstT.name : '',
                          isNewTopic: topics.length === 0,
                          subtopic_id: firstSt ? String(firstSt.id) : '',
                          subtopic: firstSt ? firstSt.name : '',
                          isNewSubtopic: subtopics.length === 0,
                          title: prev.title || (firstSt ? `${firstSt.name} — Complete Illustrated Notes` : prev.title),
                        }));
                      }}
                      options={coursesList}
                      placeholder="-- Select Master Course --"
                    />
                  </div>

                  {/* Metadata Subtopic Selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                      Linked Syllabus Subtopic (Optional)
                    </label>
                    <select
                      value={form.course_metadata_id}
                      onChange={(e) => handleMetadataSelectInForm(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputClass}`}
                    >
                      <option value="">-- Choose Existing Metadata Subtopic --</option>
                      {metadataOptionsForForm.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.subject} &gt; {m.topic} &gt; {m.subtopic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject, Topic, Subtopic Cascading 3NF Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Subject */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Subject
                      </label>
                      {availableSubjectsForForm.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, isNewSubject: !prev.isNewSubject, subject_id: '', subject: '' }))}
                          className="text-[9px] font-bold text-[#d8b056] hover:underline cursor-pointer"
                        >
                          {form.isNewSubject ? '← Pick Existing' : '+ Type Custom'}
                        </button>
                      )}
                    </div>
                    {!form.isNewSubject && availableSubjectsForForm.length > 0 ? (
                      <select
                        value={form.subject_id}
                        onChange={(e) => {
                          const sid = e.target.value;
                          const found = availableSubjectsForForm.find((s) => String(s.id) === String(sid));
                          const topics = sid ? (hierarchy.relationalTopicsBySubject?.[String(sid)] || []) : [];
                          const firstT = topics[0];
                          let subtopics = firstT ? (hierarchy.relationalSubtopicsByTopic?.[String(firstT.id)] || []) : [];
                          if (subtopics.length === 0 && Array.isArray(hierarchy.subtopics) && firstT) {
                            subtopics = hierarchy.subtopics.filter((st) => String(st.topic_id) === String(firstT.id));
                          }
                          const firstSt = subtopics[0];
                          setForm((prev) => ({
                            ...prev,
                            subject_id: sid,
                            subject: found ? found.name : prev.subject,
                            isNewSubject: false,
                            topic_id: firstT ? String(firstT.id) : '',
                            topic: firstT ? firstT.name : '',
                            isNewTopic: topics.length === 0,
                            subtopic_id: firstSt ? String(firstSt.id) : '',
                            subtopic: firstSt ? firstSt.name : '',
                            isNewSubtopic: subtopics.length === 0,
                            title: prev.title || (firstSt ? `${firstSt.name} — Complete Illustrated Notes` : prev.title),
                          }));
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputClass}`}
                      >
                        <option value="">-- Choose Subject ({availableSubjectsForForm.length}) --</option>
                        {availableSubjectsForForm.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value, isNewSubject: true })}
                        placeholder="e.g. Human Anatomy"
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${inputClass}`}
                      />
                    )}
                  </div>

                  {/* Topic */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Topic
                      </label>
                      {availableTopicsForForm.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, isNewTopic: !prev.isNewTopic, topic_id: '', topic: '', subtopic_id: '', subtopic: '' }))}
                          className="text-[9px] font-bold text-[#d8b056] hover:underline cursor-pointer"
                        >
                          {form.isNewTopic ? '← Pick Existing' : '+ Type Custom'}
                        </button>
                      )}
                    </div>
                    {!form.isNewTopic && availableTopicsForForm.length > 0 ? (
                      <select
                        value={form.topic_id}
                        onChange={(e) => {
                          const tid = e.target.value;
                          const found = availableTopicsForForm.find((t) => String(t.id) === String(tid));
                          let subtopics = tid ? (hierarchy.relationalSubtopicsByTopic?.[String(tid)] || []) : [];
                          if (subtopics.length === 0 && Array.isArray(hierarchy.subtopics) && tid) {
                            subtopics = hierarchy.subtopics.filter((st) => String(st.topic_id) === String(tid));
                          }
                          const firstSt = subtopics[0];
                          setForm((prev) => ({
                            ...prev,
                            topic_id: tid,
                            topic: found ? found.name : prev.topic,
                            isNewTopic: false,
                            subtopic_id: firstSt ? String(firstSt.id) : '',
                            subtopic: firstSt ? firstSt.name : '',
                            isNewSubtopic: subtopics.length === 0,
                            title: prev.title || (firstSt ? `${firstSt.name} — Complete Illustrated Notes` : prev.title),
                          }));
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputClass}`}
                      >
                        <option value="">-- Choose Topic ({availableTopicsForForm.length}) --</option>
                        {availableTopicsForForm.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value, isNewTopic: true })}
                        placeholder="e.g. Gross Anatomy"
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${inputClass}`}
                      />
                    )}
                  </div>

                  {/* Subtopic (Selectable from topic or custom typed) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Subtopic / Module
                      </label>
                      {availableSubtopicsForForm.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({
                            ...prev,
                            isNewSubtopic: !prev.isNewSubtopic,
                            subtopic_id: '',
                            subtopic: prev.isNewSubtopic && availableSubtopicsForForm[0] ? availableSubtopicsForForm[0].name : '',
                          }))}
                          className="text-[9px] font-bold text-[#d8b056] hover:underline cursor-pointer"
                        >
                          {form.isNewSubtopic ? '← Pick Existing' : '+ Type Custom'}
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
                            title: prev.title || (found ? `${found.name} — Complete Illustrated Notes` : prev.title),
                          }));
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputClass}`}
                      >
                        <option value="">-- Choose Subtopic ({availableSubtopicsForForm.length}) --</option>
                        {availableSubtopicsForForm.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                        <option value="__new__">+ Type Custom Subtopic...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.subtopic}
                        onChange={(e) => setForm({ ...form, subtopic: e.target.value, isNewSubtopic: true })}
                        placeholder="e.g. Upper Limb Overview"
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${inputClass}`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Product Identity & Details */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056]">
                  2. Product Identity
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Material Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Complete Illustrated Human Anatomy Notes & Charts (Vol 1)"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold border ${inputClass}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                      Material Format / Type
                    </label>
                    <select
                      value={form.material_type}
                      onChange={(e) => setForm({ ...form, material_type: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputClass}`}
                    >
                      <option value="Handwritten Notes">Handwritten Notes</option>
                      <option value="Formula Sheet">Formula Sheet / Cheat Sheet</option>
                      <option value="Complete Syllabus Guide">Complete Syllabus Guide</option>
                      <option value="Question Bank">Question Bank / PYQs</option>
                      <option value="Mock Exam Paper">Mock Exam Paper</option>
                      <option value="Study Notes">General Study Notes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                      Author / Faculty
                    </label>
                    <input
                      type="text"
                      value={form.author_name}
                      onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                      placeholder="e.g. Dr. A. Sharma (MD)"
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                      Badge / Tag
                    </label>
                    <select
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputClass}`}
                    >
                      <option value="">No Badge</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="Trending">Trending</option>
                      <option value="New">New</option>
                      <option value="Must Read">Must Read</option>
                      <option value="Editor's Choice">Editor&apos;s Choice</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                      Short Tagline / Summary
                    </label>
                    <input
                      type="text"
                      value={form.short_description}
                      onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                      placeholder="High-yield illustrated anatomical charts & mnemonic guides..."
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                      Total Pages
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.page_count}
                      onChange={(e) => setForm({ ...form, page_count: parseInt(e.target.value, 10) || 0 })}
                      placeholder="e.g. 142"
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${inputClass}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Detailed Description / What Students Will Learn
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Chapter breakdown, sample questions included, formulas summarized..."
                    className={`w-full px-3 py-2 rounded-xl text-xs border resize-none ${inputClass}`}
                  />
                </div>
              </div>

              {/* SECTION 3: Dynamic Pricing & Discount Engine */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#eedb9f]/10 via-[#d8b056]/5 to-transparent border border-[#d8b056]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056] flex items-center gap-1.5">
                    <span>3. Pricing, Sell Price &amp; Discount Calculation</span>
                  </div>

                  {/* Free vs Paid Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_free: !form.is_free })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        form.is_free ? 'bg-emerald-500' : 'bg-[#d8b056]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.is_free ? 'translate-x-1' : 'translate-x-6'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {form.is_free ? 'Free Resource (₹0)' : 'Paid Product'}
                    </span>
                  </div>
                </div>

                {!form.is_free ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                          Original MRP (Actual Price ₹) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.actual_price}
                            onChange={(e) => setForm({ ...form, actual_price: e.target.value })}
                            className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-bold border ${inputClass}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                          Selling Offer Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.sell_price}
                            onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
                            className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-bold border ${inputClass}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Dynamic Discount Calculation Card */}
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-[#100f0e]/90 border border-[#d8b056]/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Auto-Calculated Student Savings:
                        </span>
                        {liveDiscount.isValid ? (
                          <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mt-0.5">
                            <span>Save ₹{liveDiscount.savings}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px]">
                              {liveDiscount.percent}% DISCOUNT
                            </span>
                          </div>
                        ) : (
                          <span className="text-rose-500 font-bold text-[11px] mt-0.5 block">
                            ⚠️ {liveDiscount.warning}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Product Badge</span>
                        <span className="font-black text-sm text-[#d8b056]">
                          ₹{form.sell_price} <span className="line-through text-slate-400 text-xs">₹{form.actual_price}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>This study material is 100% FREE for students (₹0 Sell Price, 100% Discount tag applied).</span>
                  </div>
                )}
              </div>

              {/* SECTION 4: File Uploads */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056]">
                  4. PDF Document &amp; Cover Thumbnail
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PDF Upload */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                      Study Material PDF <span className="text-rose-500">*</span>
                    </label>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setPdfDragOver(true);
                      }}
                      onDragLeave={() => setPdfDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setPdfDragOver(false);
                        if (e.dataTransfer.files?.[0]) {
                          setSelectedPdf(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => pdfInputRef.current?.click()}
                      className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition ${
                        pdfDragOver
                          ? 'border-[#d8b056] bg-[#d8b056]/10'
                          : selectedPdf
                          ? 'border-purple-500/60 bg-purple-500/5'
                          : isLight
                          ? 'border-slate-300 hover:border-[#d8b056]'
                          : 'border-[#2a2824] hover:border-[#d8b056]'
                      }`}
                    >
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setSelectedPdf(e.target.files[0]);
                        }}
                        className="hidden"
                      />

                      {selectedPdf ? (
                        <div className="text-xs font-bold text-purple-500">
                          <svg className="w-6 h-6 mx-auto mb-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="truncate max-w-[200px] mx-auto">{selectedPdf.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {(selectedPdf.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      ) : editingItem?.pdf_file ? (
                        <div className="text-xs">
                          <svg className="w-6 h-6 mx-auto mb-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px] mx-auto">
                            {editingItem.pdf_file}
                          </div>
                          <div className="text-[10px] text-[#d8b056] mt-0.5">Click to replace PDF</div>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-6 h-6 mx-auto mb-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Upload PDF Document
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Up to 50MB</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Cover Upload */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                      Product Cover Thumbnail (Optional)
                    </label>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setThumbDragOver(true);
                      }}
                      onDragLeave={() => setThumbDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setThumbDragOver(false);
                        if (e.dataTransfer.files?.[0]) {
                          setSelectedThumb(e.dataTransfer.files[0]);
                          setRemoveExistingThumb(false);
                        }
                      }}
                      onClick={() => thumbInputRef.current?.click()}
                      className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition ${
                        thumbDragOver
                          ? 'border-[#d8b056] bg-[#d8b056]/10'
                          : selectedThumb
                          ? 'border-emerald-500/60 bg-emerald-500/5'
                          : isLight
                          ? 'border-slate-300 hover:border-[#d8b056]'
                          : 'border-[#2a2824] hover:border-[#d8b056]'
                      }`}
                    >
                      <input
                        ref={thumbInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedThumb(e.target.files[0]);
                            setRemoveExistingThumb(false);
                          }
                        }}
                        className="hidden"
                      />

                      {selectedThumb ? (
                        <div className="text-xs font-bold text-emerald-500">
                          <svg className="w-6 h-6 mx-auto mb-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <div className="truncate max-w-[200px] mx-auto">{selectedThumb.name}</div>
                        </div>
                      ) : editingItem?.thumbnail && !removeExistingThumb ? (
                        <div className="text-xs">
                          <img
                            src={editingItem.thumbnail_url || editingItem.thumbnail}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg mx-auto mb-1"
                          />
                          <div className="text-[10px] text-[#d8b056]">Click to replace image</div>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-6 h-6 mx-auto mb-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Upload Cover Image
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Priority & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputClass}`}
                  />
                </div>

                <div className="flex items-center gap-2 self-end pb-2">
                  <input
                    type="checkbox"
                    id="is_active_cb"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 border-slate-300 focus:ring-emerald-400 cursor-pointer"
                  />
                  <label htmlFor="is_active_cb" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Active / Visible in Catalog
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
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
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Study Material' : 'Publish Study Material'}</span>
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
                  Delete Study Material
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to permanently delete this product and its attached PDF?
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-500/10 border border-slate-500/15 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                {itemToDelete.title}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {itemToDelete.course?.course_name || itemToDelete.course_name} &bull; {itemToDelete.subject} &bull; {itemToDelete.subtopic}
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
                {actionLoading ? 'Deleting...' : 'Delete Material'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Direct Table-Row PDF Upload */}
      <input
        ref={rowPdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleRowPdfSelected}
        className="hidden"
      />
    </div>
  );
}
