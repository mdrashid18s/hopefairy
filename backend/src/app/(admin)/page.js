'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats, updateAdminInquiryStatus, getCachedAdminUser } from '../../services/adminApi.js';
import { useAdminTheme } from './AdminThemeContext.js';

function extractAdminFirstName(user) {
  if (user?.name) {
    const raw = user.name.trim();
    const generic = ['admin', 'administrator', 'hopefairy admin', 'hopefairy', 'super admin', 'user'];
    if (!generic.includes(raw.toLowerCase())) {
      return raw.split(' ')[0];
    }
  }

  const email = (user?.email || '').trim().toLowerCase();
  if (email && email.includes('@')) {
    let handle = email.split('@')[0];
    handle = handle.replace(/[0-9+._-]+$/g, '');
    const prefixMatch = handle.match(/^(?:mr|ms|mrs|dr)(.+)$/i);
    if (prefixMatch && prefixMatch[1].length >= 3) {
      handle = prefixMatch[1];
    }
    const parts = handle.split(/[._-]+/).filter(Boolean);
    if (parts.length > 0) {
      let candidate = parts[0];
      if (candidate.startsWith('rashid')) {
        return 'Rashid';
      }
      return candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  return 'Admin';
}

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';
  // Set to true to re-enable lead status column
  const SHOW_STATUS = false;

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCachedAdminUser());
    fetchStats();
  }, []);

  const adminName = extractAdminFirstName(currentUser);

  const handleStatusChange = async (inquiryId, newStatus) => {
    setUpdatingId(inquiryId);
    try {
      await updateAdminInquiryStatus(inquiryId, newStatus);
      await fetchStats();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1: Active Destinations (First), 2: Contacted, 3: Closed/Enrolled, 4: Total Inquiries (Last)
  const statCards = [
    {
      title: 'Active Destinations',
      value: stats?.active_destinations ?? 0,
      sub: `${stats?.total_destinations ?? 0} countries & course catalogues`,
      href: '/countries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconColor: 'text-emerald-500',
      iconBg: isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'LIVE ON SITE',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    },
    {
      title: 'Contacted Students',
      value: stats?.contacted_leads ?? 0,
      sub: `${stats?.scheduled_leads ?? 0} sessions scheduled`,
      href: '/inquiries?status=contacted',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      iconColor: 'text-blue-500',
      iconBg: isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20',
      badge: 'IN PROGRESS',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    },
    {
      title: 'Closed / Enrolled',
      value: stats?.closed_leads ?? 0,
      sub: 'Successfully assisted students',
      href: '/inquiries?status=closed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconColor: 'text-purple-500',
      iconBg: isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-500/10 border-purple-500/20',
      badge: 'CONVERTED',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    },
    {
      title: 'Total Inquiries',
      value: stats?.total_inquiries ?? 0,
      sub: `${stats?.new_leads ?? 0} new leads pending review`,
      href: '/inquiries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconColor: 'text-amber-500',
      iconBg: isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-400/10 border-amber-400/20',
      badge: stats?.new_leads > 0 ? `${stats.new_leads} NEW` : 'ACTIVE CRM',
      badgeColor: 'bg-amber-400/10 text-amber-600 border-amber-400/30',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Welcome Banner (Redesigned with Warm Luxury Aesthetics & Perfect Contrast) */}
      <div className="admin-welcome-banner relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 border transition-all duration-300">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Welcome back, <span className="text-[#d8b056]">{adminName}</span> 👋
            </h1>
            <p className={`text-xs sm:text-sm max-w-xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Your live operational overview for study abroad destinations, student inquiries &amp; enrollments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-1 sm:pt-0">
            <Link
              href="/users"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>+ Setup User</span>
            </Link>
            <Link
              href="/countries"
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all cursor-pointer whitespace-nowrap ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-[#e5dfd3] shadow-xs'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Countries</span>
            </Link>
            <Link
              href="/inquiries"
              className={`col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all cursor-pointer whitespace-nowrap ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-[#e5dfd3] shadow-xs'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              <span>View All Leads</span>
            </Link>
          </div>
        </div>

        {/* Ambient Subtle Gold Glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-[#d8b056]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Stat Cards Grid (Clean 2x2 on Mobile, 4-Cols on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {statCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            title={`View ${card.title}`}
            className="admin-stat-card group relative p-3.5 sm:p-5 sm:p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden shadow-xs hover:shadow-md"
          >
            {/* Ambient Corner Glow on Hover */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-[#d8b056]/15 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className={`text-[10.5px] sm:text-xs font-bold uppercase tracking-wider line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {card.title}
                </span>
                <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-xs shrink-0`}>
                  {card.icon}
                </div>
              </div>

              <div className="my-1 sm:my-2">
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {card.value}
                </span>
              </div>
            </div>

            <div className={`pt-2 sm:pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-1.5 mt-2 sm:mt-3 ${isLight ? 'border-[#f0ece1]' : 'border-slate-800/60'}`}>
              <span className={`text-[9.5px] sm:text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {card.sub}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {card.badge && (
                  <span className={`text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                )}
                <svg
                  className="w-3 h-3 text-slate-400 group-hover:text-[#d8b056] group-hover:translate-x-0.5 transition-all duration-200 hidden sm:block shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Leads Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 dark:border-[#24221e] overflow-hidden shadow-sm dark:shadow-none">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Student Inquiries</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time leads submitted across HopeFairy website</p>
          </div>
          <Link
            href="/inquiries"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
          >
            View All Inquiries &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm text-slate-700 bg-white">
            <thead className="bg-white text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-5 py-3.5">Destination & Program</th>
                <th className="px-5 py-3.5 text-center">Submitted On</th>
                {SHOW_STATUS && <th className="px-5 py-3.5 text-center">Lead Status</th>}
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {stats?.recent_inquiries?.length > 0 ? (
                stats.recent_inquiries.map((inq) => (
                  <tr key={inq.id} className="bg-white">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{inq.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{inq.phone}</span>
                        <span>•</span>
                        <span>{inq.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-semibold text-amber-700">
                        {inq.destination_name || 'Global / Not Specified'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {inq.course || inq.interest || 'General Counselling'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap text-center">
                      {new Date(inq.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    {SHOW_STATUS && (
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          <select
                            value={inq.lead_status || 'new'}
                            disabled={updatingId === inq.id}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none transition cursor-pointer ${
                              inq.lead_status === 'new'
                                ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                                : inq.lead_status === 'contacted'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : inq.lead_status === 'scheduled'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <option value="new" className={isLight ? 'bg-white text-amber-700' : 'bg-slate-900 text-amber-400'}>New Lead</option>
                            <option value="contacted" className={isLight ? 'bg-white text-blue-700' : 'bg-slate-900 text-blue-400'}>Contacted</option>
                            <option value="scheduled" className={isLight ? 'bg-white text-purple-700' : 'bg-slate-900 text-purple-400'}>Scheduled</option>
                            <option value="closed" className={isLight ? 'bg-white text-emerald-700' : 'bg-slate-900 text-emerald-400'}>Closed / Enrolled</option>
                          </select>
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <Link
                        href={`/inquiries?search=${encodeURIComponent(inq.email)}`}
                        className="text-xs font-semibold text-slate-400 hover:text-white transition"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={SHOW_STATUS ? 5 : 4} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No inquiries recorded yet. Forms submitted on the site will appear here in real-time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
