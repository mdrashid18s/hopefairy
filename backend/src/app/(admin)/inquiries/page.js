'use client';

import { useEffect, useState } from 'react';
import {
  getAdminInquiries,
  updateAdminInquiryStatus,
  toggleAdminInquiry,
  deleteAdminInquiry,
} from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';

export default function AdminInquiriesPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'inquiry' | 'query'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [togglingInquiryId, setTogglingInquiryId] = useState(null);

  // In-place table pagination (50 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, searchTerm]);

  const fetchInquiries = async () => {
    try {
      const data = await getAdminInquiries({
        status: statusFilter,
        type: typeFilter,
        search: searchTerm,
      });
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setInquiries(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries();
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    const prevInquiries = inquiries;
    // Optimistic update in table list
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, lead_status: newStatus } : item))
    );
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev) => ({ ...prev, lead_status: newStatus }));
    }

    try {
      await updateAdminInquiryStatus(id, newStatus);
    } catch (err) {
      setInquiries(prevInquiries);
      alert('Status update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (inq) => {
    if (togglingInquiryId === inq.id) return;
    setTogglingInquiryId(inq.id);

    const prevStatus = inq.is_active !== false;
    const nextStatus = !prevStatus;
    setInquiries((prev) =>
      prev.map((item) => (item.id === inq.id ? { ...item, is_active: nextStatus } : item))
    );
    if (selectedInquiry && selectedInquiry.id === inq.id) {
      setSelectedInquiry((prev) => ({ ...prev, is_active: nextStatus }));
    }

    try {
      const res = await toggleAdminInquiry(inq.id);
      if (res && res.is_active !== undefined) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === inq.id ? { ...item, is_active: Boolean(res.is_active) } : item))
        );
      }
    } catch (err) {
      setInquiries((prev) =>
        prev.map((item) => (item.id === inq.id ? { ...item, is_active: prevStatus } : item))
      );
      alert('Failed to toggle inquiry status: ' + err.message);
    } finally {
      setTogglingInquiryId(null);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteAdminInquiry(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      if (selectedInquiry && selectedInquiry.id === itemToDelete.id) {
        setSelectedInquiry(null);
      }
      setInquiries((prev) => prev.filter((item) => item.id !== itemToDelete.id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Set to true to re-enable lead status filter options and status column
  const SHOW_STATUS = false;

  const statuses = [
    { label: 'All Leads', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Closed / Enrolled', value: 'closed' },
  ];

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(inquiries.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentInquiries = inquiries.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
          >
            Student Leads & Inquiries
          </h1>
          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: isLight ? '#64748b' : '#9e988b' }}
          >
            Comprehensive CRM: track student inquiries, academic interests, and admission progression.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, phone, course, city..."
              className={`w-full sm:w-80 px-3.5 py-2 pl-9 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d8b056] border transition ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-[#24221e] text-[#faf7f0]'
              }`}
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] rounded-xl text-xs font-bold shadow-xs transition shrink-0 cursor-pointer hover:brightness-105"
          >
            Search
          </button>
        </form>
      </div>

      {/* Type Segmented Filter (Inquiries vs Queries) */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Lead Source:
          </span>
          <div className={`inline-flex p-1 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-950 border-[#24221e]'}`}>
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('inquiry')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                typeFilter === 'inquiry'
                  ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inquiry
            </button>
            <button
              onClick={() => setTypeFilter('query')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                typeFilter === 'query'
                  ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Query
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Status (Hidden for now as requested) */}
      {SHOW_STATUS && (
        <div className={`flex items-center gap-2 overflow-x-auto pb-2 border-b ${isLight ? 'border-slate-100' : 'border-[#24221e]'}`}>
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === s.value
                  ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-[#d8b056]/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-950 bg-white border border-slate-100 hover:bg-slate-50'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-[#24221e] hover:bg-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Leads Table */}
      <div
        className="rounded-2xl border overflow-hidden transition-colors"
        style={{
          backgroundColor: isLight ? '#ffffff' : '#100f0e',
          borderColor: isLight ? 'rgba(226, 232, 240, 0.8)' : '#24221e',
          boxShadow: isLight ? '0 10px 30px -4px rgba(15, 23, 42, 0.05)' : 'none',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm" style={{ backgroundColor: isLight ? '#ffffff' : '#100f0e' }}>
            <thead
              className="text-xs font-semibold uppercase tracking-wider border-b"
              style={{
                backgroundColor: isLight ? '#fcfaf6' : '#141311',
                borderColor: isLight ? '#f1ece1' : '#24221e',
                color: isLight ? '#64748b' : '#9e988b',
              }}
            >
              <tr>
                <th className="px-5 py-3.5">Student &amp; Type</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Destination &amp; Intake</th>
                <th className="px-5 py-3.5">Program / Query Note</th>
                <th className="px-5 py-3.5 text-center">Submission Date</th>
                {SHOW_STATUS && <th className="px-5 py-3.5 text-center">Status</th>}
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{
                borderColor: isLight ? '#f1ece1' : '#1a1916',
              }}
            >
              {loading ? (
                <tr>
                  <td colSpan={SHOW_STATUS ? 7 : 6} className="px-5 py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-[#d8b056]/20 border-t-[#d8b056] rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Loading leads...</p>
                  </td>
                </tr>
              ) : currentInquiries.length > 0 ? (
                currentInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    style={{ backgroundColor: isLight ? '#ffffff' : '#100f0e' }}
                  >
                    {/* Student Profile & Type Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-sm cursor-pointer hover:underline"
                          style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                          onClick={() => setSelectedInquiry(inq)}
                        >
                          {inq.name}
                        </span>

                        {inq.type === 'query' ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shrink-0"
                            style={{
                              background: isLight ? '#ecfeff' : 'rgba(6, 182, 212, 0.12)',
                              borderColor: isLight ? '#a5f3fc' : 'rgba(6, 182, 212, 0.3)',
                              color: isLight ? '#0891b2' : '#22d3ee',
                            }}
                            title="Submitted via Main Page Quick Query Form"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Query
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shrink-0"
                            style={{
                              background: isLight ? '#fefce8' : 'rgba(216, 176, 86, 0.12)',
                              borderColor: isLight ? '#fde047' : 'rgba(216, 176, 86, 0.3)',
                              color: isLight ? '#946c1a' : '#e4c775',
                            }}
                            title="Submitted via Contact Page Detailed Form"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Inquiry
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: isLight ? '#64748b' : '#9e988b' }}
                        >
                          <svg className="w-3 h-3 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {inq.city || (inq.type === 'query' ? 'Homepage Quick Lead' : 'India')}
                        </span>
                        {inq.qualification && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-md font-medium border"
                            style={{
                              background: isLight ? '#f8fafc' : '#171614',
                              borderColor: isLight ? '#e2e8f0' : '#292622',
                              color: isLight ? '#475569' : '#b6b0a4',
                            }}
                          >
                            {inq.qualification}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${inq.phone}`}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: isLight ? '#1e293b' : '#f1ede3' }}
                        >
                          {inq.phone}
                        </a>
                        {inq.phone && (
                          <a
                            href={`https://wa.me/${inq.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${inq.name}, greetings from HopeFairy! Regarding your ${inq.type === 'query' ? 'query' : 'study abroad inquiry'}...`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition"
                            title="Chat on WhatsApp"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.977.575 3.82 1.572 5.377L2.14 22l4.743-1.411A10.016 10.016 0 0012.031 22C17.568 22 22 17.505 22 12.031 22 6.495 17.568 2 12.031 2zm5.795 14.167c-.244.685-1.415 1.258-1.954 1.332-.516.071-1.18.102-3.418-.823-2.863-1.183-4.707-4.103-4.85-4.293-.143-.191-1.157-1.542-1.157-2.94 0-1.398.735-2.088.995-2.373.26-.285.571-.357.762-.357.19 0 .381.002.548.01.178.008.416-.067.65.495.244.588.831 2.03.905 2.176.074.146.124.318.026.512-.098.194-.148.315-.292.486-.144.17-.305.381-.436.511-.144.143-.294.298-.126.586.168.288.747 1.233 1.603 1.996 1.102.982 2.031 1.287 2.319 1.43.288.143.456.12.624-.074.168-.194.721-.838.913-1.124.192-.286.384-.239.648-.143.264.096 1.674.789 1.961.933.288.144.48.216.552.338.072.122.072.709-.172 1.394z" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <div className="text-xs mt-1">
                        <a
                          href={`mailto:${inq.email}`}
                          className="hover:underline truncate block max-w-xs"
                          style={{ color: isLight ? '#64748b' : '#9e988b' }}
                        >
                          {inq.email}
                        </a>
                      </div>
                    </td>

                    {/* Destination & Intake */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div
                        className="text-xs font-bold"
                        style={{ color: isLight ? '#946c1a' : '#d8b056' }}
                      >
                        {inq.destination_name || (inq.type === 'query' ? 'General Advisory' : 'Global / Multiple')}
                      </div>
                      <div
                        className="text-[11px] mt-0.5"
                        style={{ color: isLight ? '#64748b' : '#9e988b' }}
                      >
                        {inq.intake ? (
                          <>Intake: <span className="font-semibold">{inq.intake}</span></>
                        ) : (
                          <span className="italic opacity-80">{inq.type === 'query' ? 'Direct Consultation' : 'Upcoming Intake'}</span>
                        )}
                      </div>
                    </td>

                    {/* Program / Query Note */}
                    <td className="px-5 py-4 max-w-xs">
                      {inq.type === 'query' ? (
                        <div>
                          <div
                            className="text-xs font-semibold truncate flex items-center gap-1.5"
                            style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                            title={inq.message || 'Direct Consultation Request'}
                          >
                            <svg className="w-3.5 h-3.5 text-cyan-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="truncate">{inq.message || 'Quick consultation inquiry'}</span>
                          </div>
                          <div
                            className="text-[11px] truncate mt-0.5"
                            style={{ color: isLight ? '#64748b' : '#9e988b' }}
                          >
                            {inq.interest || 'Homepage Lead'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            className="text-xs font-semibold truncate"
                            style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                            title={inq.course || 'Under Evaluation'}
                          >
                            {inq.course || inq.interest || 'General Counselling'}
                          </div>
                          <div
                            className="text-[11px] truncate mt-0.5"
                            style={{ color: isLight ? '#64748b' : '#9e988b' }}
                          >
                            {inq.study_level ? `${inq.study_level} • ` : ''}
                            {inq.interest || 'Study Abroad'}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Submission Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-center" style={{ color: isLight ? '#64748b' : '#9e988b' }}>
                      <div>
                        {new Date(inq.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(inq.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Lead Status (Hidden for now as requested) */}
                    {SHOW_STATUS && (
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          <select
                            value={inq.lead_status || 'new'}
                            disabled={updatingId === inq.id}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none transition cursor-pointer ${
                              inq.lead_status === 'new'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                : inq.lead_status === 'contacted'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                                : inq.lead_status === 'scheduled'
                                ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            }`}
                          >
                            <option value="new" className="bg-slate-900 text-amber-400">New</option>
                            <option value="contacted" className="bg-slate-900 text-blue-400">Contacted</option>
                            <option value="scheduled" className="bg-slate-900 text-purple-400">Scheduled</option>
                            <option value="closed" className="bg-slate-900 text-emerald-400">Closed / Enrolled</option>
                          </select>
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleActive(inq)}
                          disabled={togglingInquiryId === inq.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            inq.is_active !== false
                              ? isLight
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : isLight
                                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          } ${togglingInquiryId === inq.id ? 'opacity-70 cursor-wait' : ''}`}
                          title="Toggle active/archived status"
                        >
                          {togglingInquiryId === inq.id ? (
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${inq.is_active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          )}
                          <span>{togglingInquiryId === inq.id ? 'Saving...' : inq.is_active !== false ? 'Active' : 'Archived'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-[#d8b056] hover:text-[#946c1a]'
                              : 'bg-slate-900 border-[#24221e] text-slate-300 hover:border-[#d8b056] hover:text-[#d8b056]'
                          }`}
                          title="View complete lead details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(inq);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition cursor-pointer"
                          title="Delete entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={SHOW_STATUS ? 7 : 6} className="px-5 py-10 text-center text-slate-500 text-sm">
                    No leads found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (In-Place Table Pagination) */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
            isLight ? 'border-slate-100 bg-[#fcfaf6]/60' : 'border-[#24221e] bg-[#141311]'
          }`}
        >
          {/* Submission Count Summary */}
          <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {inquiries.length > 0 ? (
              <>
                Showing <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{startIndex + 1}</span> to{' '}
                <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {Math.min(endIndex, inquiries.length)}
                </span>{' '}
                of <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{inquiries.length}</span> submissions (50 per page)
              </>
            ) : (
              'Showing 0 submissions'
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-center sm:self-auto flex-wrap">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                  currentPage === 1
                    ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:border-[#d8b056] hover:text-[#946c1a] shadow-2xs'
                    : 'bg-[#141311] border-[#292622] text-[#faf7f0] hover:border-[#d8b056] hover:text-[#d8b056]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev</span>
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 1 && p <= currentPage + 1)
                  );
                })
                .map((p, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const hasGap = prevPage && p - prevPage > 1;

                  return (
                    <div key={p} className="flex items-center gap-1.5">
                      {hasGap && (
                        <span className={`px-1.5 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                          …
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                          currentPage === p
                            ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-sm font-extrabold'
                            : isLight
                            ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                            : 'bg-[#141311] border border-[#24221e] text-[#b6b0a4] hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                  currentPage === totalPages
                    ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:border-[#d8b056] hover:text-[#946c1a] shadow-2xs'
                    : 'bg-[#141311] border-[#292622] text-[#faf7f0] hover:border-[#d8b056] hover:text-[#d8b056]'
                }`}
              >
                <span>Next</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Inquiry / Query Detail Dossier Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`border rounded-3xl p-6 sm:p-8 max-w-2xl sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
              isLight
                ? 'bg-white border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900'
                : 'bg-[#100f0e] border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-start justify-between pb-5 border-b ${isLight ? 'border-slate-100' : 'border-[#24221e]'}`}>
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 shadow-md ${
                    selectedInquiry.type === 'query'
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/20'
                      : 'bg-gradient-to-br from-[#eedb9f] to-[#d8b056] text-slate-950 shadow-[#d8b056]/20'
                  }`}
                >
                  {selectedInquiry.name ? selectedInquiry.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold tracking-tight">{selectedInquiry.name}</h3>

                    {selectedInquiry.type === 'query' ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Query
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-[#d8b056]/15 text-[#946c1a] dark:text-[#eedb9f] border-[#d8b056]/30 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Inquiry
                      </span>
                    )}

                    {SHOW_STATUS && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          selectedInquiry.lead_status === 'new'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : selectedInquiry.lead_status === 'contacted'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                            : selectedInquiry.lead_status === 'scheduled'
                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        }`}
                      >
                        {selectedInquiry.lead_status || 'New'}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Lead #{selectedInquiry.id} • Submitted on{' '}
                    {new Date(selectedInquiry.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isLight
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Close Modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Contact Action Strip */}
            <div className="flex items-center gap-2 sm:gap-3 py-4 flex-wrap">
              {selectedInquiry.phone && (
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedInquiry.name}, greetings from HopeFairy! Thank you for reaching out regarding your ${selectedInquiry.type === 'query' ? 'consultation query' : 'study abroad inquiry'}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.977.575 3.82 1.572 5.377L2.14 22l4.743-1.411A10.016 10.016 0 0012.031 22C17.568 22 22 17.505 22 12.031 22 6.495 17.568 2 12.031 2zm5.795 14.167c-.244.685-1.415 1.258-1.954 1.332-.516.071-1.18.102-3.418-.823-2.863-1.183-4.707-4.103-4.85-4.293-.143-.191-1.157-1.542-1.157-2.94 0-1.398.735-2.088.995-2.373.26-.285.571-.357.762-.357.19 0 .381.002.548.01.178.008.416-.067.65.495.244.588.831 2.03.905 2.176.074.146.124.318.026.512-.098.194-.148.315-.292.486-.144.17-.305.381-.436.511-.144.143-.294.298-.126.586.168.288.747 1.233 1.603 1.996 1.102.982 2.031 1.287 2.319 1.43.288.143.456.12.624-.074.168-.194.721-.838.913-1.124.192-.286.384-.239.648-.143.264.096 1.674.789 1.961.933.288.144.48.216.552.338.072.122.072.709-.172 1.394z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              )}
              {selectedInquiry.phone && (
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-500/30 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call {selectedInquiry.phone}</span>
                </a>
              )}
              {selectedInquiry.email && (
                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                    `HopeFairy - ${selectedInquiry.type === 'query' ? 'Consultation Query Follow-up' : 'Study Abroad Counselling'} (${selectedInquiry.name})`
                  )}`}
                  className="px-4 py-2 bg-[#d8b056]/10 hover:bg-[#d8b056]/20 text-[#946c1a] dark:text-[#d8b056] rounded-xl text-xs font-bold border border-[#d8b056]/30 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email Student</span>
                </a>
              )}
            </div>

            {/* Comprehensive Information Grid */}
            <div className="space-y-4 my-4">
              {/* Group 1: Student Profile & Contact */}
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950 border-[#24221e]'
                }`}
              >
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056] mb-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Student Identity &amp; Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Full Name</span>
                    <span className="font-bold text-sm block mt-0.5">{selectedInquiry.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone / WhatsApp</span>
                    <a href={`tel:${selectedInquiry.phone}`} className="font-bold text-sm block mt-0.5 hover:underline" style={{ color: isLight ? '#946c1a' : '#d8b056' }}>
                      {selectedInquiry.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email Address</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="font-bold text-sm block mt-0.5 hover:underline truncate" style={{ color: isLight ? '#946c1a' : '#d8b056' }}>
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location / City</span>
                    <span className="font-bold text-sm block mt-0.5">{selectedInquiry.city || (selectedInquiry.type === 'query' ? 'Homepage Quick Query' : 'Not specified')}</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Target Destination & Academic Plans (Adapted for Inquiry vs Query) */}
              {selectedInquiry.type === 'inquiry' ? (
                <div
                  className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950 border-[#24221e]'
                  }`}
                >
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056] mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Academic Aspirations &amp; Preferences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Destination</span>
                      <span className="font-bold text-sm block mt-0.5" style={{ color: isLight ? '#946c1a' : '#d8b056' }}>
                        {selectedInquiry.destination_name || 'Global / Multiple'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Intake</span>
                      <span className="font-semibold text-sm block mt-0.5">{selectedInquiry.intake || 'Immediate / Flexible'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Preferred Course / Major</span>
                      <span className="font-semibold text-sm block mt-0.5">{selectedInquiry.course || 'Under Evaluation'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Study Level</span>
                      <span className="font-semibold text-sm block mt-0.5">{selectedInquiry.study_level || 'Undergraduate / Postgraduate'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950 border-[#24221e]'
                  }`}
                >
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Consultation Context
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submission Origin</span>
                      <span className="font-bold text-sm block mt-0.5 text-cyan-600 dark:text-cyan-400">Main Page Query Form</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Destination</span>
                      <span className="font-semibold text-sm block mt-0.5">{selectedInquiry.destination_name || 'General Counselling'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Service Scope</span>
                      <span className="font-semibold text-sm block mt-0.5">{selectedInquiry.interest || 'Quick Consultation'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Group 3: Background & Counseling Scope (Only for Detailed Inquiries) */}
              {selectedInquiry.type === 'inquiry' && (
                <div
                  className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950 border-[#24221e]'
                  }`}
                >
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056] mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Background &amp; Service Scope
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Highest Qualification</span>
                      <span className="font-semibold text-sm block mt-0.5">{selectedInquiry.qualification || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Area of Interest</span>
                      <span className="font-semibold text-sm block mt-0.5">{selectedInquiry.interest || 'General Counselling'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submission Source</span>
                      <span className="font-semibold text-sm block mt-0.5">Contact Page Detailed Form</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Student Note / Query Message Box */}
            <div
              className={`p-4 rounded-2xl border mb-6 ${
                isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950 border-[#24221e]'
              }`}
            >
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                <svg className={`w-3.5 h-3.5 ${selectedInquiry.type === 'query' ? 'text-cyan-500' : 'text-[#d8b056]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {selectedInquiry.type === 'query' ? "Student's Consultation Query Message" : "Student's Specific Notes / Queries"}
              </span>
              <p
                className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  selectedInquiry.message
                    ? isLight
                      ? 'text-slate-800'
                      : 'text-slate-200'
                    : 'italic text-slate-400'
                }`}
              >
                {selectedInquiry.message || 'No additional message was provided with this submission.'}
              </p>
            </div>

            {/* Modal Footer Controls */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t ${isLight ? 'border-slate-100' : 'border-[#24221e]'}`}>
              {SHOW_STATUS ? (
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Update Status:</span>
                  <select
                    value={selectedInquiry.lead_status || 'new'}
                    disabled={updatingId === selectedInquiry.id}
                    onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border transition focus:outline-none cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-900 focus:border-[#d8b056]'
                        : 'bg-slate-950 border-[#24221e] text-[#faf7f0] focus:border-[#d8b056]'
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="closed">Closed / Enrolled</option>
                  </select>
                </div>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isLight
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'border-[#24221e] text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl ${
              isLight
                ? 'bg-white border-[#e5dfd3] text-slate-900 shadow-slate-200/50'
                : 'bg-[#100f0e] border-[#292622] text-[#faf7f0]'
            }`}
          >
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isLight ? 'border-slate-100' : 'border-[#24221e]'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete {itemToDelete.type === 'query' ? 'Query' : 'Inquiry'}</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Permanent removal action</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
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
              Are you sure you want to remove the {itemToDelete.type === 'query' ? 'query' : 'inquiry'} submitted by{' '}
              <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{itemToDelete.name}</strong>?
            </p>
            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-[#24221e]'}`}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  isLight
                    ? 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
