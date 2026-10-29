'use client';

import { useEffect, useState } from 'react';
import {
  getAdminSettings,
  updateAdminSettings,
  getAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
} from '../../../services/adminApi.js';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'faqs'
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingFaq, setSavingFaq] = useState(false);
  const [deletingFaqId, setDeletingFaqId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [modalError, setModalError] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    name: 'HopeFairy',
    tagline: 'Where Dreams Meet Destinations',
    phone: '+91 98116 09755',
    email: 'info@hopefairy.com',
    whatsapp_href: 'https://wa.me/919811609755',
    hours: 'Mon – Sat · 10:00 AM – 7:00 PM IST',
    location: 'India',
  });

  // FAQs State
  const [faqs, setFaqs] = useState([]);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ q: '', a: '', is_active: true, display_order: 1 });

  const loadData = async () => {
    try {
      const [fetchedSettings, fetchedFaqs] = await Promise.all([
        getAdminSettings(),
        getAdminFaqs(),
      ]);
      if (fetchedSettings) {
        setSettings((prev) => ({ ...prev, ...fetchedSettings }));
      }
      const safeFaqs = Array.isArray(fetchedFaqs)
        ? fetchedFaqs
        : Array.isArray(fetchedFaqs?.items)
        ? fetchedFaqs.items
        : Array.isArray(fetchedFaqs?.data)
        ? fetchedFaqs.data
        : [];
      setFaqs(safeFaqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessMsg('');

    try {
      await updateAdminSettings(settings);
      setSuccessMsg('Site settings updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to update settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setFaqForm({
      q: '',
      a: '',
      is_active: true,
      display_order: faqs.length + 1,
    });
    setModalError('');
    setFaqModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditingFaq(f);
    setFaqForm({
      q: f.q || '',
      a: f.a || '',
      is_active: Boolean(f.is_active),
      display_order: f.display_order || 1,
    });
    setModalError('');
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    setSavingFaq(true);
    setModalError('');

    try {
      if (editingFaq) {
        await updateAdminFaq(editingFaq.id, faqForm);
      } else {
        await createAdminFaq(faqForm);
      }
      setFaqModalOpen(false);
      const updated = await getAdminFaqs();
      setFaqs(updated || []);
      setSuccessMsg(editingFaq ? 'FAQ updated successfully.' : 'FAQ created successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to save FAQ item.');
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;
    setDeletingFaqId(id);
    try {
      await deleteAdminFaq(id);
      setFaqs((prev) => prev.filter((item) => item.id !== id));
      setSuccessMsg('FAQ deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeletingFaqId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-9 h-9 border-3 border-[#d8b056]/30 border-t-[#d8b056] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#faf7f0]">
            Site Settings &amp; FAQs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure agency phone numbers, WhatsApp shortcuts, operating schedule, and manage student FAQs.
          </p>
        </div>

        {activeTab === 'faqs' && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-[#d8b056]/20 hover:brightness-105 active:scale-[0.99] transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New FAQ</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#24221e] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-[#d8b056]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-stone-900/60 dark:hover:bg-stone-800'
          }`}
        >
          Agency Contact &amp; Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'faqs'
              ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-[#d8b056]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-stone-900/60 dark:hover:bg-stone-800'
          }`}
        >
          <span>FAQs</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-black/15 dark:bg-white/15">
            {faqs.length}
          </span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab 1: Settings Form */}
      {activeTab === 'settings' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-[#24221e] bg-white dark:bg-[#100f0e] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 98116 09755"
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#d8b056] focus:ring-[#d8b056]/25 dark:bg-[#141311] dark:border-[#282520] dark:text-[#faf7f0] dark:placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Public Contact Email
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="info@hopefairy.com"
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#d8b056] focus:ring-[#d8b056]/25 dark:bg-[#141311] dark:border-[#282520] dark:text-[#faf7f0] dark:placeholder-stone-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  WhatsApp Direct URL
                </label>
                <input
                  type="text"
                  value={settings.whatsapp_href || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_href: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#d8b056] focus:ring-[#d8b056]/25 dark:bg-[#141311] dark:border-[#282520] dark:text-[#faf7f0] dark:placeholder-stone-500"
                  placeholder="https://wa.me/919811609755"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                  Counselling Hours / Schedule
                </label>
                <input
                  type="text"
                  value={settings.hours || ''}
                  onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#d8b056] focus:ring-[#d8b056]/25 dark:bg-[#141311] dark:border-[#282520] dark:text-[#faf7f0] dark:placeholder-stone-500"
                  placeholder="Mon – Sat · 10:00 AM – 7:00 PM IST"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                Brand Tagline
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#d8b056] focus:ring-[#d8b056]/25 dark:bg-[#141311] dark:border-[#282520] dark:text-[#faf7f0] dark:placeholder-stone-500"
                placeholder="Where Dreams Meet Destinations"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-[#24221e] flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-[#d8b056]/20 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {savingSettings ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#0b0b0c] border-t-transparent rounded-full animate-spin" />
                    <span>Updating Settings...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Site Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: FAQs Manager */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-stone-800 p-12 text-center bg-white/50 dark:bg-[#100f0e]/50">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#d8b056]/12 border border-[#d8b056]/25 text-[#d8b056] mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#faf7f0]">No FAQs Created Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Add frequently asked questions about study abroad, test preparation, scholarships, and admissions.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-[#d8b056]/20 hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
              >
                <span>+ Create First FAQ</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div
                  key={f.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-[#24221e] bg-white dark:bg-[#100f0e] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#d8b056]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-[#d8b056]/15 text-[#b38827] dark:text-[#eedb9f] border border-[#d8b056]/30">
                          #{f.display_order ?? i + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                            f.is_active
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {f.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#faf7f0]">
                          {f.q}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap pl-0.5">
                        {f.a}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(f)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-stone-800 hover:border-[#d8b056]/40 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        disabled={deletingFaqId === f.id}
                        onClick={() => handleDeleteFaq(f.id)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 hover:border-rose-500/40 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {deletingFaqId === f.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          FAQ MODAL: Sleek, Compact Luxury Blueprint (Zero Scrollbar)
          - Max-w-lg / max-w-xl canvas with compact internal padding (p-4 sm:p-5).
          - Crisp, high-contrast borders and ergonomic compact field heights.
          - 3-row guidance answer textarea that fits the complete form comfortably on screen.
          - Clean inline priority sequence and visibility toggle.
         ========================================================================= */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg sm:max-w-xl rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-[#2f2c27] bg-white dark:bg-[#100f0e] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] dark:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.95)] text-slate-900 dark:text-[#faf7f0] p-4 sm:p-5 my-auto animate-in zoom-in-95 duration-200">
            
            {/* Executive Header */}
            <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-200 dark:border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#eedb9f]/20 via-[#d8b056]/15 to-[#c89b3c]/20 border border-[#d8b056]/40 text-[#d8b056] shadow-sm shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#b38827] dark:text-[#eedb9f] bg-[#d8b056]/15 px-2 py-0.5 rounded-full border border-[#d8b056]/30">
                      Knowledge Base
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {editingFaq ? `Editing Item #${editingFaq.id}` : 'New Knowledge Item'}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-[#faf7f0]">
                    {editingFaq ? 'Edit FAQ Item' : 'Create FAQ Item'}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editingFaq
                      ? 'Update the inquiry question and guidance published on the HopeFairy website.'
                      : 'Publish standard answers to common student, parent, and visa inquiries across destinations.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-stone-700"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Banner */}
            {modalError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveFaq} className="space-y-3">
              {/* Question Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Question / Inquiry Prompt <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-stone-500">Student Search Friendly</span>
                </div>
                <input
                  type="text"
                  required
                  value={faqForm.q}
                  onChange={(e) => setFaqForm({ ...faqForm, q: e.target.value })}
                  placeholder="e.g. What are the IELTS score requirements for top UK universities?"
                  className="admin-modal-input w-full px-3.5 py-2 text-xs sm:text-sm font-medium placeholder-slate-400 dark:placeholder-stone-500"
                />
              </div>

              {/* Answer Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Detailed Guidance &amp; Answer <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-stone-500">Supports Multi-line Formatting</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={faqForm.a}
                  onChange={(e) => setFaqForm({ ...faqForm, a: e.target.value })}
                  placeholder="Provide a comprehensive and authoritative answer explaining criteria, documentation, waiver conditions, and step-by-step advisory from HopeFairy counsellors..."
                  className="admin-modal-input w-full px-3.5 py-2 text-xs sm:text-sm leading-relaxed placeholder-slate-400 dark:placeholder-stone-500"
                />
              </div>

              {/* Metadata Row: Priority Sequence & Live Visibility Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-0.5">
                {/* Column 1 (4 cols): Display Order */}
                <div className="sm:col-span-4">
                  <label className="block text-[10.5px] font-black uppercase tracking-wider mb-1 text-slate-800 dark:text-slate-200">
                    Display Sequence / Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={faqForm.display_order}
                    onChange={(e) => setFaqForm({ ...faqForm, display_order: parseInt(e.target.value) || 1 })}
                    className="admin-modal-input w-full px-3.5 py-2 text-xs sm:text-sm font-bold"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 pl-0.5">
                    Lower numbers display higher.
                  </p>
                </div>

                {/* Column 2 (8 cols): Interactive Live Visibility Toggle Card */}
                <div className="sm:col-span-8">
                  <label className="block text-[10.5px] font-black uppercase tracking-wider mb-1 text-slate-800 dark:text-slate-200">
                    Website Visibility Status
                  </label>
                  <div
                    onClick={() => setFaqForm({ ...faqForm, is_active: !faqForm.is_active })}
                    className={`px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      faqForm.is_active
                        ? 'border-[#d8b056] bg-[#d8b056]/8 dark:bg-[#d8b056]/12 shadow-sm'
                        : 'border-slate-300 dark:border-stone-800 bg-slate-50 dark:bg-stone-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        faqForm.is_active ? 'bg-[#d8b056] text-[#0b0b0c]' : 'bg-slate-200 dark:bg-stone-800 text-slate-500'
                      }`}>
                        {faqForm.is_active ? '✓' : '—'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {faqForm.is_active ? 'Active (Live on Website)' : 'Draft Mode (Hidden)'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          {faqForm.is_active
                            ? 'Students and parents will see this FAQ live'
                            : 'Saved in system, hidden from public website'}
                        </div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      faqForm.is_active ? 'border-[#d8b056] bg-[#d8b056]' : 'border-slate-400 dark:border-stone-600'
                    }`}>
                      {faqForm.is_active && <div className="w-1.5 h-1.5 rounded-full bg-[#0b0b0c]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-slate-200 dark:border-[#24221e]">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Syncs real-time with HopeFairy Public FAQs</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFaqModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-stone-700 hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFaq}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-[#d8b056]/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer flex items-center gap-1.5"
                  >
                    {savingFaq ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#0b0b0c] border-t-transparent rounded-full animate-spin" />
                        <span>Saving FAQ...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{editingFaq ? 'Update FAQ Item' : 'Publish FAQ Item'}</span>
                      </>
                    )}
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
