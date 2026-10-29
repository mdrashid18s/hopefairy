'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  getAdminCountries,
  createAdminCountry,
  updateAdminCountry,
  toggleAdminCountry,
  deleteAdminCountry,
  getAdminCountryCourses,
  createAdminCountryCourse,
  updateAdminCountryCourse,
  toggleAdminCountryCourse,
  deleteAdminCountryCourse,
  getAdminCourses,
} from '../../../services/adminApi.js';
import CountryFlagBadge from '../CountryFlagBadge.js';
import { useAdminTheme } from '../AdminThemeContext.js';

export default function AdminCountriesPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState('countries'); // 'countries' | 'courses'
  const [countries, setCountries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [masterCourses, setMasterCourses] = useState([]);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingCountryId, setTogglingCountryId] = useState(null);
  const [togglingCourseId, setTogglingCourseId] = useState(null);

  // Searchable Course Selector states in modal
  const [courseSearchInput, setCourseSearchInput] = useState('');
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef(null);

  // Close course dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setCourseDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modals state for Country
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [deleteCountryModalOpen, setDeleteCountryModalOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);
  const [countryFormError, setCountryFormError] = useState('');

  // Form state for Country
  const initialCountryForm = {
    name: '',
    tagline: '',
    intakes: '',
    is_active: true,
    display_order: 1,
  };
  const [countryForm, setCountryForm] = useState(initialCountryForm);

  // Modals state for Course
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Form state for Course
  const initialCourseForm = {
    country_id: '',
    course_name: '',
    degree_level: 'Master (Postgraduate)',
    duration: '1 - 2 Years',
    avg_fee: '',
    intakes: 'Sep, Jan, May',
    requirements: '',
    description: '',
    is_active: true,
    display_order: 1,
  };
  const [courseForm, setCourseForm] = useState(initialCourseForm);

  const fetchData = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      const [countriesData, coursesData, masterCoursesData] = await Promise.all([
        getAdminCountries(),
        getAdminCountryCourses(),
        getAdminCourses().catch(() => []),
      ]);
      const rawCountries = Array.isArray(countriesData)
        ? countriesData
        : (Array.isArray(countriesData?.items) ? countriesData.items : []);
      const rawCourses = Array.isArray(coursesData)
        ? coursesData
        : (Array.isArray(coursesData?.items) ? coursesData.items : []);
      const rawMasterCourses = Array.isArray(masterCoursesData)
        ? masterCoursesData
        : (Array.isArray(masterCoursesData?.items) ? masterCoursesData.items : []);

      setCountries(rawCountries);
      setCourses(rawCourses);
      setMasterCourses(rawMasterCourses);
    } catch (err) {
      setError(err.message || 'Failed to load country & course data.');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // Comprehensive course catalog for instant search & selection
  const allAvailableCourses = useMemo(() => {
    const defaultList = [
      'Data Science & Artificial Intelligence',
      'Computer Science & Software Engineering',
      'Master of Business Administration (MBA)',
      'Information Technology & Cloud Systems',
      'Business Analytics & Big Data Management',
      'Cyber Security & Information Assurance',
      'Biotechnology & Medical Sciences',
      'Electrical & Electronic Engineering',
      'Mechanical & Aerospace Engineering',
      'Civil, Structural & Environmental Engineering',
      'Robotics & Autonomous Systems',
      'Finance & Investment Banking',
      'Accounting & Global Financial Management',
      'International Business & Management',
      'Digital Marketing & Brand Strategy',
      'Medicine (MBBS / MD Programs)',
      'Dentistry & Oral Health (BDS)',
      'Pharmacy, Pharmacology & Drug Discovery',
      'Public Health & Global Health Systems (MPH)',
      'Nursing & Advanced Clinical Practice',
      'International Law & Commercial Arbitration (LL.M)',
      'Architecture & Sustainable Urban Design',
      'Graphic Design, UX & Digital Media',
      'Hospitality, Events & Tourism Management',
      'Psychology & Cognitive Neuroscience',
      'Supply Chain & Global Logistics',
      'Economics, Econometrics & Public Policy',
      'B.Tech (Bachelor of Technology)',
      'B.E. (Bachelor of Engineering)',
      'M.Tech (Master of Technology)',
      'BBA (Bachelor of Business Administration)',
      'B.Sc Computer Science',
      'B.Com (Honours) in Accounting & Finance',
    ];

    const fromCountryCourses = courses.map((c) => c.course_name).filter(Boolean);
    const fromMasterCourses = masterCourses.map((c) => c.course_name).filter(Boolean);

    const merged = Array.from(new Set([...defaultList, ...fromMasterCourses, ...fromCountryCourses]));
    return merged.sort((a, b) => a.localeCompare(b));
  }, [courses, masterCourses]);

  const filteredCatalogCourses = useMemo(() => {
    const q = (courseSearchInput || courseForm.course_name || '').trim().toLowerCase();
    if (!q) return allAvailableCourses;
    return allAvailableCourses.filter((name) => name.toLowerCase().includes(q));
  }, [allAvailableCourses, courseSearchInput, courseForm.course_name]);

  const selectCourse = (cName) => {
    const lower = cName.toLowerCase();
    let suggestedLevel = courseForm.degree_level;
    if (
      lower.includes('master') ||
      lower.includes('m.sc') ||
      lower.includes('m.tech') ||
      lower.includes('mba') ||
      lower.includes('postgraduate') ||
      lower.includes('ll.m') ||
      lower.includes('mph')
    ) {
      suggestedLevel = 'Master (Postgraduate)';
    } else if (
      lower.includes('bachelor') ||
      lower.includes('b.tech') ||
      lower.includes('b.e.') ||
      lower.includes('bba') ||
      lower.includes('b.sc') ||
      lower.includes('b.com') ||
      lower.includes('mbbs') ||
      lower.includes('bds') ||
      lower.includes('undergraduate')
    ) {
      suggestedLevel = 'Bachelor (Undergraduate)';
    }

    setCourseForm((prev) => ({
      ...prev,
      course_name: cName,
      degree_level: suggestedLevel,
    }));
    setCourseSearchInput('');
    setCourseDropdownOpen(false);
  };

  // ---------------- Country Handlers ----------------
  const openAddCountryModal = () => {
    setEditingCountry(null);
    setCountryFormError('');
    setCountryForm({
      ...initialCountryForm,
      display_order: countries.length + 1,
    });
    setCountryModalOpen(true);
  };

  const openEditCountryModal = (c) => {
    setEditingCountry(c);
    setCountryFormError('');
    setCountryForm({
      name: c.name || '',
      tagline: c.tagline || '',
      intakes: Array.isArray(c.intakes) ? c.intakes.join(', ') : c.intakes || '',
      is_active: Boolean(c.is_active),
      display_order: c.display_order || 1,
    });
    setCountryModalOpen(true);
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    setCountryFormError('');
    if (!countryForm.name.trim()) {
      setCountryFormError('Please enter a country name.');
      return;
    }
    setActionLoading(true);
    try {
      if (editingCountry) {
        await updateAdminCountry(editingCountry.id, countryForm);
      } else {
        await createAdminCountry(countryForm);
      }
      setCountryModalOpen(false);
      await fetchData(false);
    } catch (err) {
      setCountryFormError(err.message || 'Failed to save country.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCountry = async (c) => {
    if (togglingCountryId === c.id) return;
    setTogglingCountryId(c.id);

    // 1. Optimistic update: immediately flip boolean in local state (Zero delay, Zero page reload!)
    const prevStatus = Boolean(c.is_active);
    const nextStatus = !prevStatus;
    setCountries((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, is_active: nextStatus } : item))
    );

    try {
      const res = await toggleAdminCountry(c.id);
      if (res && res.is_active !== undefined) {
        setCountries((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, is_active: Boolean(res.is_active) } : item))
        );
      }
    } catch (err) {
      // Revert if API failed
      setCountries((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, is_active: prevStatus } : item))
      );
      alert('Failed to toggle status: ' + (err.message || 'Network error'));
    } finally {
      setTogglingCountryId(null);
    }
  };

  const handleDeleteCountry = async () => {
    if (!countryToDelete) return;
    setActionLoading(true);
    try {
      await deleteAdminCountry(countryToDelete.id);
      setDeleteCountryModalOpen(false);
      setCountryToDelete(null);
      await fetchData(false);
    } catch (err) {
      alert('Failed to delete country: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------- Course Handlers ----------------
  const openAddCourseModal = (presetCountryId = '') => {
    setEditingCourse(null);
    setCourseSearchInput('');
    setCourseDropdownOpen(false);
    const targetCountryId = presetCountryId || selectedCountryFilter || (countries[0]?.id ? String(countries[0].id) : '');
    const foundCountry = countries.find((c) => String(c.id) === String(targetCountryId));

    setCourseForm({
      ...initialCourseForm,
      country_id: targetCountryId,
      avg_fee: foundCountry?.avg_tuition || '£15,000 / year',
      display_order: courses.filter((co) => String(co.country_id) === String(targetCountryId)).length + 1,
    });
    setCourseModalOpen(true);
  };

  const openEditCourseModal = (course) => {
    setEditingCourse(course);
    setCourseSearchInput(course.course_name || '');
    setCourseDropdownOpen(false);
    setCourseForm({
      country_id: String(course.country_id || ''),
      course_name: course.course_name || '',
      degree_level: course.degree_level || 'Master (Postgraduate)',
      duration: course.duration || '1 - 2 Years',
      avg_fee: course.avg_fee || '',
      intakes: course.intakes || 'Sep, Jan, May',
      requirements: course.requirements || '',
      description: course.description || '',
      is_active: Boolean(course.is_active),
      display_order: course.display_order || 1,
    });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.country_id) {
      alert('Please select a country for this course.');
      return;
    }
    setActionLoading(true);
    try {
      if (editingCourse) {
        await updateAdminCountryCourse(editingCourse.id, courseForm);
      } else {
        await createAdminCountryCourse(courseForm);
      }
      setCourseModalOpen(false);
      await fetchData(false);
    } catch (err) {
      alert('Save course failed: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCourse = async (course) => {
    if (togglingCourseId === course.id) return;
    setTogglingCourseId(course.id);

    // Optimistic toggle: instantly flip boolean in state (Zero page reload)
    const prevStatus = Boolean(course.is_active);
    const nextStatus = !prevStatus;
    setCourses((prev) =>
      prev.map((item) => (item.id === course.id ? { ...item, is_active: nextStatus } : item))
    );

    try {
      const res = await toggleAdminCountryCourse(course.id);
      if (res && res.is_active !== undefined) {
        setCourses((prev) =>
          prev.map((item) => (item.id === course.id ? { ...item, is_active: Boolean(res.is_active) } : item))
        );
      }
    } catch (err) {
      setCourses((prev) =>
        prev.map((item) => (item.id === course.id ? { ...item, is_active: prevStatus } : item))
      );
      alert('Failed to toggle course: ' + (err.message || 'Network error'));
    } finally {
      setTogglingCourseId(null);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setActionLoading(true);
    try {
      await deleteAdminCountryCourse(courseToDelete.id);
      setDeleteCourseModalOpen(false);
      setCourseToDelete(null);
      await fetchData(false);
    } catch (err) {
      alert('Failed to delete course: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Jump from country row to courses filtered by that country
  const viewCountryCourses = (countryId) => {
    setSelectedCountryFilter(String(countryId));
    setActiveTab('courses');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#d8b056]/20 border-t-[#d8b056] rounded-full animate-spin"></div>
      </div>
    );
  }

  const safeCountries = Array.isArray(countries) ? countries : (Array.isArray(countries?.items) ? countries.items : []);
  const safeCourses = Array.isArray(courses) ? courses : (Array.isArray(courses?.items) ? courses.items : []);

  const activeCountriesCount = safeCountries.filter((c) => c.is_active).length;
  const activeCoursesCount = safeCourses.filter((c) => c.is_active).length;

  // Filtered courses based on selected dropdown & search
  const filteredCourses = safeCourses.filter((c) => {
    const matchCountry = selectedCountryFilter ? String(c.country_id) === String(selectedCountryFilter) : true;
    const matchSearch = searchQuery
      ? c.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.degree_level?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCountry && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#faf7f0] tracking-tight">Countries & Program Courses</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage international target countries and link degree programs via relational database tables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'countries' ? (
            <button
              onClick={openAddCountryModal}
              className="inline-flex items-center gap-2 text-[#080809] px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition cursor-pointer hover:scale-102"
              style={{
                background: 'linear-gradient(135deg, #e4c775 0%, #d8b056 45%, #c89b3c 100%)',
                boxShadow: '0 4px 14px -2px rgba(200, 155, 60, 0.4)',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Country</span>
            </button>
          ) : (
            <button
              onClick={() => openAddCourseModal()}
              className="inline-flex items-center gap-2 text-[#080809] px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition cursor-pointer hover:scale-102"
              style={{
                background: 'linear-gradient(135deg, #e4c775 0%, #d8b056 45%, #c89b3c 100%)',
                boxShadow: '0 4px 14px -2px rgba(200, 155, 60, 0.4)',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Course</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Modern Segmented Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-md shadow-slate-200/50">
        <button
          onClick={() => setActiveTab('countries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'countries'
              ? 'text-[#080809] shadow-md'
              : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
          }`}
          style={
            activeTab === 'countries'
              ? {
                  background: 'linear-gradient(135deg, #e4c775 0%, #d8b056 45%, #c89b3c 100%)',
                  boxShadow: '0 4px 14px -2px rgba(200, 155, 60, 0.35)',
                }
              : {}
          }
        >
          <span>🎓 Target Countries</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeTab === 'countries'
                ? 'bg-black/15 text-[#080809]'
                : isLight
                ? 'bg-slate-100 text-slate-600'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {activeCountriesCount} / {countries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'text-[#080809] shadow-md'
              : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
          }`}
          style={
            activeTab === 'courses'
              ? {
                  background: 'linear-gradient(135deg, #e4c775 0%, #d8b056 45%, #c89b3c 100%)',
                  boxShadow: '0 4px 14px -2px rgba(200, 155, 60, 0.35)',
                }
              : {}
          }
        >
          <span>🌍 Country Courses</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeTab === 'courses'
                ? 'bg-black/15 text-[#080809]'
                : isLight
                ? 'bg-slate-100 text-slate-600'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {activeCoursesCount} / {courses.length}
          </span>
        </button>
      </div>

      {/* ---------------- TAB 1: COUNTRIES TABLE ---------------- */}
      {activeTab === 'countries' && (
        <div className="bg-white rounded-2xl border border-slate-100 dark:border-[#24221e] overflow-hidden shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm text-slate-700 bg-white">
              <thead className="bg-white text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Country</th>
                  <th className="px-5 py-3.5">Tagline & Intakes</th>
                  <th className="px-5 py-3.5 text-center">Program Courses</th>
                  <th className="px-5 py-3.5 text-center">Order</th>
                  <th className="px-5 py-3.5 text-center">Active Status</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {countries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                      No study destination countries configured yet.
                    </td>
                  </tr>
                ) : (
                  countries.map((c) => {
                    const countryCourseCount = courses.filter((co) => co.country_id === c.id).length;
                    return (
                      <tr key={c.id} className="bg-white">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <CountryFlagBadge code={c.country_code || c.code} />
                            <span
                              className="font-bold text-sm"
                              style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                            >
                              {c.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 max-w-xs">
                          <p
                            className="text-xs line-clamp-1"
                            style={{ color: isLight ? '#334155' : '#cbd5e1' }}
                          >
                            {c.tagline || 'Study Abroad'}
                          </p>
                          <p className="text-[11px] font-medium mt-0.5" style={{ color: isLight ? '#946c1a' : '#d8b056' }}>
                            Intakes: {Array.isArray(c.intakes) ? c.intakes.join(', ') : c.intakes || 'Flexible'}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => viewCountryCourses(c.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer hover:scale-105"
                              style={{
                                background: isLight ? 'rgba(216, 176, 86, 0.12)' : 'rgba(216, 176, 86, 0.16)',
                                borderColor: 'rgba(216, 176, 86, 0.45)',
                                color: isLight ? '#946c1a' : '#e4c775',
                                boxShadow: '0 2px 8px -2px rgba(200, 155, 60, 0.25)',
                              }}
                              title="View and edit relational courses"
                            >
                              <span>🌍 {countryCourseCount} Courses</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center text-xs font-mono text-slate-400">
                          #{c.display_order ?? 0}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleToggleCountry(c)}
                              disabled={togglingCountryId === c.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                                c.is_active
                                  ? isLight
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : isLight
                                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              } ${togglingCountryId === c.id ? 'opacity-70 cursor-wait' : ''}`}
                              title="Click to toggle country active/inactive"
                            >
                              {togglingCountryId === c.id ? (
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              )}
                              <span>{togglingCountryId === c.id ? 'Updating...' : c.is_active ? 'Active' : 'Inactive'}</span>
                            </button>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditCountryModal(c)}
                              className="p-1.5 text-slate-400 hover:text-[#d8b056] hover:bg-[#d8b056]/10 rounded-lg transition cursor-pointer"
                              title="Edit country details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setCountryToDelete(c);
                                setDeleteCountryModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete country"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: COUNTRY COURSES RELATIONAL TABLE ---------------- */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/40">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-600">Filter by Country:</label>
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#d8b056]"
              >
                <option value="">All Countries ({courses.length} courses)</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({courses.filter((co) => co.country_id === c.id).length})
                  </option>
                ))}
              </select>

              {selectedCountryFilter && (
                <button
                  onClick={() => setSelectedCountryFilter('')}
                  className="text-xs hover:underline font-semibold cursor-pointer"
                  style={{ color: isLight ? '#946c1a' : '#d8b056' }}
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, degrees..."
                className="bg-white border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-4 py-2 w-full sm:w-64 focus:outline-none focus:border-[#d8b056] placeholder:text-slate-400"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-2xl border border-slate-100 dark:border-[#24221e] overflow-hidden shadow-sm dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-left text-sm text-slate-700 bg-white">
                <thead className="bg-white text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Course Name & Degree</th>
                    <th className="px-5 py-3.5">Target Country</th>
                    <th className="px-5 py-3.5 text-center">Duration & Fees</th>
                    <th className="px-5 py-3.5 text-center">Intakes</th>
                    <th className="px-5 py-3.5 text-center">Active Status</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                        No courses found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => (
                      <tr key={course.id} className="bg-white">
                        <td className="px-5 py-4">
                          <div
                            className="font-bold text-sm"
                            style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                          >
                            {course.course_name}
                          </div>
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: isLight ? '#946c1a' : '#d8b056' }}
                          >
                            {course.degree_level || 'Postgraduate Degree'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <CountryFlagBadge code={course.country?.country_code || course.country?.code} size="sm" />
                            <span
                              className="text-xs font-semibold"
                              style={{ color: isLight ? '#1e293b' : '#f1ede3' }}
                            >
                              {course.country?.name || 'Country ID: ' + course.country_id}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center text-xs">
                          <div
                            className="font-semibold"
                            style={{ color: isLight ? '#1e293b' : '#f1ede3' }}
                          >
                            {course.duration || '1 - 2 Years'}
                          </div>
                          <div
                            className="text-[11px] mt-0.5"
                            style={{ color: isLight ? '#64748b' : '#9e988b' }}
                          >
                            {course.avg_fee || 'Competitive'}
                          </div>
                        </td>

                        <td
                          className="px-5 py-4 text-center text-xs"
                          style={{ color: isLight ? '#475569' : '#cbd5e1' }}
                        >
                          {course.intakes || 'Sep / Jan'}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleToggleCourse(course)}
                              disabled={togglingCourseId === course.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                                course.is_active
                                  ? isLight
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : isLight
                                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              } ${togglingCourseId === course.id ? 'opacity-70 cursor-wait' : ''}`}
                              title="Click to toggle course active/inactive"
                            >
                              {togglingCourseId === course.id ? (
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <span className={`w-1.5 h-1.5 rounded-full ${course.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              )}
                              <span>{togglingCourseId === course.id ? 'Updating...' : course.is_active ? 'Active' : 'Inactive'}</span>
                            </button>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditCourseModal(course)}
                              className="p-1.5 text-slate-400 hover:text-[#d8b056] hover:bg-[#d8b056]/10 rounded-lg transition cursor-pointer"
                              title="Edit course details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setCourseToDelete(course);
                                setDeleteCourseModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete course"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: ADD / EDIT COUNTRY (Streamlined, Zero Technical Clutter) ---------------- */}
      {countryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`border rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto ${
              isLight
                ? 'bg-white border-slate-100 text-slate-900 shadow-2xl shadow-slate-200/50'
                : 'bg-[#100f0e] border-[#24221e] text-[#faf7f0] shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isLight
                      ? 'bg-[#d8b056]/15 text-[#946c1a] border border-[#d8b056]/30'
                      : 'bg-[#d8b056]/10 text-[#d8b056] border border-[#d8b056]/20'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">
                    {editingCountry ? 'Edit Country Details' : 'Add Study Destination Country'}
                  </h2>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    ISO country code, flag, and URLs are automatically handled by the system.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCountryModalOpen(false)}
                className={`p-1.5 rounded-lg transition ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveCountry} className="space-y-4">
              {/* Inline Country Validation Error Alert */}
              {countryFormError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold leading-relaxed">{countryFormError}</span>
                </div>
              )}

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Country Name *
                </label>
                <input
                  type="text"
                  required
                  value={countryForm.name}
                  onChange={(e) => {
                    setCountryForm({ ...countryForm, name: e.target.value });
                    if (countryFormError) setCountryFormError('');
                  }}
                  placeholder="e.g. Germany, Australia, United States, Japan"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056] focus:ring-1 focus:ring-[#d8b056]/30'
                      : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Tagline / Overview
                </label>
                <input
                  type="text"
                  value={countryForm.tagline}
                  onChange={(e) => setCountryForm({ ...countryForm, tagline: e.target.value })}
                  placeholder="e.g. World-class education with 2-year post-study work rights"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056] focus:ring-1 focus:ring-[#d8b056]/30'
                      : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Intakes (comma-separated)
                </label>
                <input
                  type="text"
                  value={countryForm.intakes}
                  onChange={(e) => setCountryForm({ ...countryForm, intakes: e.target.value })}
                  placeholder="e.g. September, January, May"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056] focus:ring-1 focus:ring-[#d8b056]/30'
                      : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={countryForm.display_order}
                  onChange={(e) => setCountryForm({ ...countryForm, display_order: parseInt(e.target.value) || 1 })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056]'
                      : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-5 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setCountryModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isLight
                      ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                      : 'text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white'
                  }`}
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
                  {actionLoading && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>}
                  <span>{editingCountry ? 'Update Country' : 'Create Country'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: ADD / EDIT COURSE ---------------- */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`border rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto ${
              isLight
                ? 'bg-white border-slate-100 text-slate-900 shadow-2xl shadow-slate-200/50'
                : 'bg-[#100f0e] border-[#24221e] text-[#faf7f0] shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isLight
                      ? 'bg-[#d8b056]/15 text-[#946c1a] border border-[#d8b056]/30'
                      : 'bg-[#d8b056]/10 text-[#d8b056] border border-[#d8b056]/20'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {editingCourse ? 'Edit Program Course' : 'Add Course for Target Country'}
                  </h2>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Configure curriculum, tuition range, intakes, and admission requirements.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCourseModalOpen(false)}
                className={`p-1.5 rounded-lg transition ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Target Country (Relationship) *
                </label>
                <select
                  required
                  value={courseForm.country_id}
                  onChange={(e) => setCourseForm({ ...courseForm, country_id: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056]'
                      : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                  }`}
                >
                  <option value="">Select Target Country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course with Live Searchable Catalog Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Course *
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Type to search or select from catalog
                  </span>
                </div>

                <div className="relative" ref={courseDropdownRef}>
                  <div className="relative">
                    {/* Search Icon */}
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Search Input */}
                    <input
                      type="text"
                      required
                      value={courseForm.course_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCourseForm({ ...courseForm, course_name: val });
                        setCourseSearchInput(val);
                        setCourseDropdownOpen(true);
                      }}
                      onFocus={() => setCourseDropdownOpen(true)}
                      placeholder="Search or enter course (e.g. Data Science, MBA, Computer Science...)"
                      className={`w-full pl-10 pr-20 py-2.5 rounded-xl text-sm transition focus:outline-none ${
                        isLight
                          ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#d8b056]'
                          : 'bg-slate-950 border border-slate-800 text-white focus:bg-[#181715] focus:border-[#d8b056]'
                      }`}
                    />

                    {/* Right Controls: Clear & Chevron */}
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                      {courseForm.course_name && (
                        <button
                          type="button"
                          onClick={() => {
                            setCourseForm({ ...courseForm, course_name: '' });
                            setCourseSearchInput('');
                            setCourseDropdownOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition cursor-pointer"
                          title="Clear course"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setCourseDropdownOpen((prev) => !prev)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition cursor-pointer"
                        title="Toggle course catalog"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${courseDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Searchable Dropdown Popup */}
                  {courseDropdownOpen && (
                    <div
                      className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                        isLight
                          ? 'bg-white/98 border-[#e5dfd3] shadow-slate-300/60 text-slate-800'
                          : 'bg-[#100f0e]/98 border-[#292622] shadow-black/90 text-[#faf7f0]'
                      }`}
                    >
                      {/* Catalog Header Bar */}
                      <div className={`px-3.5 py-2 border-b text-[11px] font-semibold flex items-center justify-between sticky top-0 backdrop-blur-md ${
                        isLight ? 'bg-slate-50/95 border-slate-100 text-slate-500' : 'bg-[#161513]/95 border-[#24221e] text-slate-400'
                      }`}>
                        <span>Available Courses ({filteredCatalogCourses.length})</span>
                        {courseSearchInput && (
                          <span className="text-[10px] text-amber-500 font-normal truncate max-w-[150px]">
                            Filtering: "{courseSearchInput}"
                          </span>
                        )}
                      </div>

                      <div className="p-1 space-y-0.5">
                        {/* Custom Course Entry Option */}
                        {courseSearchInput.trim() && !filteredCatalogCourses.some((c) => c.toLowerCase() === courseSearchInput.trim().toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => selectCourse(courseSearchInput.trim())}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                              isLight ? 'hover:bg-amber-50 text-amber-900' : 'hover:bg-amber-400/10 text-amber-300'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 text-xs font-bold">
                              +
                            </span>
                            <span className="truncate">
                              Use custom course: <strong className="font-bold underline">{courseSearchInput.trim()}</strong>
                            </span>
                          </button>
                        )}

                        {filteredCatalogCourses.length === 0 && !courseSearchInput.trim() ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No courses available. Type to enter a custom course.
                          </div>
                        ) : (
                          filteredCatalogCourses.map((cName) => {
                            const isSelected = courseForm.course_name.toLowerCase() === cName.toLowerCase();
                            return (
                              <button
                                key={cName}
                                type="button"
                                onClick={() => selectCourse(cName)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? isLight
                                      ? 'bg-amber-100/70 text-amber-900 font-bold'
                                      : 'bg-amber-400/15 text-amber-300 font-bold'
                                    : isLight
                                    ? 'hover:bg-slate-100 text-slate-800'
                                    : 'hover:bg-[#1a1917] text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                  <span className="truncate">{cName}</span>
                                </div>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Degree Level
                  </label>
                  <select
                    value={courseForm.degree_level}
                    onChange={(e) => setCourseForm({ ...courseForm, degree_level: e.target.value })}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056]'
                        : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                    }`}
                  >
                    <option value="Master (Postgraduate)">Master (Postgraduate)</option>
                    <option value="Bachelor (Undergraduate)">Bachelor (Undergraduate)</option>
                    <option value="MBA / Management">MBA / Management</option>
                    <option value="PhD / Research">PhD / Research</option>
                    <option value="Diploma / Pathway">Diploma / Pathway</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="e.g. 1 - 2 Years"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056]'
                        : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Tuition / Avg Fee
                  </label>
                  <input
                    type="text"
                    value={courseForm.avg_fee}
                    onChange={(e) => setCourseForm({ ...courseForm, avg_fee: e.target.value })}
                    placeholder="e.g. £14,000 - £22,000 / year"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056]'
                        : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Intakes
                  </label>
                  <input
                    type="text"
                    value={courseForm.intakes}
                    onChange={(e) => setCourseForm({ ...courseForm, intakes: e.target.value })}
                    placeholder="e.g. Sep, Jan, May"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056]'
                        : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Entry Requirements
                </label>
                <textarea
                  rows="2"
                  value={courseForm.requirements}
                  onChange={(e) => setCourseForm({ ...courseForm, requirements: e.target.value })}
                  placeholder="e.g. Minimum 60% in Bachelor degree, IELTS 6.5 with no band less than 6.0"
                  className={`w-full rounded-xl px-3.5 py-2 text-sm transition focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056]'
                      : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                  }`}
                ></textarea>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={courseForm.display_order}
                  onChange={(e) => setCourseForm({ ...courseForm, display_order: parseInt(e.target.value) || 1 })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#d8b056]'
                      : 'bg-slate-950 border border-slate-800 text-white focus:border-[#d8b056]'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-5 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isLight
                      ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                      : 'text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white'
                  }`}
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
                  {actionLoading && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>}
                  <span>{editingCourse ? 'Update Course' : 'Create Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- DELETE COUNTRY CONFIRMATION MODAL ---------------- */}
      {deleteCountryModalOpen && countryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl ${
              isLight
                ? 'bg-white border-slate-100 text-slate-900 shadow-slate-200/50'
                : 'bg-[#100f0e] border-[#24221e] text-[#faf7f0]'
            }`}
          >
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete Country</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Permanent removal action</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteCountryModalOpen(false)}
                className={`p-1.5 rounded-lg transition ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className={`text-xs leading-relaxed mb-6 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Are you sure you want to remove <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{countryToDelete.name}</strong>? All associated program course relations will be removed automatically.
            </p>
            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <button
                type="button"
                onClick={() => setDeleteCountryModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isLight
                    ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                    : 'text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCountry}
                disabled={actionLoading}
                className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DELETE COURSE CONFIRMATION MODAL ---------------- */}
      {deleteCourseModalOpen && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl ${
              isLight
                ? 'bg-white border-slate-100 text-slate-900 shadow-slate-200/50'
                : 'bg-[#100f0e] border-[#24221e] text-[#faf7f0]'
            }`}
          >
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete Course</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Permanent removal action</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteCourseModalOpen(false)}
                className={`p-1.5 rounded-lg transition ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className={`text-xs leading-relaxed mb-6 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Are you sure you want to delete <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{courseToDelete.course_name}</strong>?
            </p>
            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <button
                type="button"
                onClick={() => setDeleteCourseModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isLight
                    ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                    : 'text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={actionLoading}
                className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
