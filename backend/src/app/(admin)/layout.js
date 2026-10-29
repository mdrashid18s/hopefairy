'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../components/layout/Logo.jsx';
import { getAdminToken, getCachedAdminUser } from '../../services/adminApi.js';
import { AdminThemeProvider, useAdminTheme } from './AdminThemeContext.js';
import AdminThemeToggle from './AdminThemeToggle.js';
import AdminUserMenu from './AdminUserMenu.js';
import './admin-theme.css';

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  // Normalize pathname to prevent trailing slash mismatches
  // (the dashboard is the root "/", which must not collapse to "")
  const cleanPath = (pathname || '').replace(/\/+$/, '') || '/';
  const isAuthPage = cleanPath === '/login' || cleanPath === '/forgot-password';

  useEffect(() => {
    const token = getAdminToken();
    if (!token && !isAuthPage) {
      router.replace('/login');
    } else if (token && (cleanPath === '/login' || cleanPath === '/forgot-password')) {
      router.replace('/');
    } else {
      setUser(getCachedAdminUser());
    }
    setAuthChecked(true);
  }, [cleanPath, isAuthPage, router]);


  // If on login or forgot-password, render immediately with ZERO loading delay
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Fast skeleton for dashboard auth check
  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
        <div
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border ${
            isLight ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="w-5 h-5 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
          <span className={`text-xs font-semibold tracking-wide ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Checking Authorization...
          </span>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: 'Countries & Abroad',
      href: '/countries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'India Courses',
      href: '/courses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
        </svg>
      ),
    },
    {
      name: 'Curriculum Explorer',
      href: '/courses/curriculum',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
    },
    {
      name: 'Metadata',
      href: '/metadata',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Resources',
      href: '/resources',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: 'Inquiries & Leads',
      href: '/inquiries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: 'Services',
      href: '/services',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Testimonials',
      href: '/testimonials',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      name: 'User Accounts',
      href: '/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const isExpanded = isSidebarHovered || mobileMenuOpen;

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row antialiased transition-colors duration-200 ${
        isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Mobile Top Header */}
      <header
        className={`md:hidden flex items-center justify-between px-3.5 py-2.5 border-b sticky top-0 z-40 transition-colors ${
          isLight ? 'bg-white/98 backdrop-blur-md border-[#f1f5f9]' : 'bg-[#100f0e]/98 backdrop-blur-md border-[#24221e]'
        }`}
      >
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Logo className="h-7 w-7 shrink-0" />
          <div className="flex items-center gap-1.5 truncate">
            <span className={`font-extrabold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Hope<span className="text-[#d8b056]">Fairy</span>
            </span>
            <span className="text-[10px] bg-[#d8b056]/12 text-[#d8b056] border border-[#d8b056]/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Admin
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <AdminThemeToggle />
          <AdminUserMenu user={user} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:text-slate-950 bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white bg-[#1a1917] border-[#2d2a24] hover:bg-[#25221d]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Desktop Static Rail Spacer (avoids layout jumping when sidebar expands on hover) */}
      <div className="hidden md:block w-[74px] shrink-0" />

      {/* Hover-Expandable Enterprise Sidebar */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r transition-[width,box-shadow,transform] duration-300 ease-in-out ${
          isLight ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-800'
        } ${
          /* Mobile Drawer */
          mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          /* Desktop Hover-Expandable Rail */
          isSidebarHovered ? 'md:w-64 md:shadow-2xl' : 'md:w-[74px] md:shadow-xs'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div
            className={`px-3 py-3.5 border-b flex items-center justify-between transition-colors overflow-hidden ${
              isLight ? 'border-slate-100' : 'border-slate-800/80'
            }`}
          >
            <div className="flex items-center overflow-hidden">
              {/* Authentic HopeFairy Logo — Perfect Circular Emblem */}
              <Link
                href="/"
                className="w-[48px] h-10 flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105"
                title="Return to HopeFairy Home"
              >
                <Logo className="h-10 w-10" />
              </Link>

              {/* Full Brand Text (smoothly fades & expands on hover) */}
              <div
                className={`transition-all duration-200 overflow-hidden whitespace-nowrap pl-2.5 ${
                  isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 pointer-events-none'
                }`}
              >
                <h1 className={`text-base font-bold tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Hope<span className="text-amber-500">Fairy</span>
                </h1>
                <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Control Hub
                </p>
              </div>
            </div>

            {/* Version Pill */}
            {isExpanded && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                v2.0
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                cleanPath === item.href ||
                (item.href === '/countries' && (cleanPath.startsWith('/countries/') || cleanPath.startsWith('/destinations/'))) ||
                (item.href === '/courses' && cleanPath.startsWith('/courses/') && !cleanPath.startsWith('/courses/curriculum')) ||
                (item.href !== '/' && item.href !== '/countries' && item.href !== '/courses' && cleanPath.startsWith(item.href + '/'));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  title={!isExpanded ? item.name : undefined}
                  className={`group relative flex items-center h-11 rounded-xl transition-all duration-150 overflow-hidden ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-950 hover:bg-amber-50/90'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {/* Fixed Center Icon Slot */}
                  <div className="w-[48px] h-11 flex items-center justify-center shrink-0">
                    <span
                      className={
                        isActive
                          ? 'text-slate-950'
                          : isLight
                          ? 'text-slate-600 group-hover:text-slate-950'
                          : 'text-slate-400 group-hover:text-white'
                      }
                    >
                      {item.icon}
                    </span>
                  </div>

                  {/* Text Label that smoothly expands on hover */}
                  <span
                    className={`whitespace-nowrap font-medium text-sm transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? 'opacity-100 max-w-[170px] pr-2'
                        : 'opacity-0 max-w-0 pointer-events-none'
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Clean Tooltip when collapsed */}
                  {!isExpanded && (
                    <div
                      className={`hidden md:group-hover:flex absolute left-full ml-3 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none border ${
                        isLight
                          ? 'bg-white text-slate-900 border-[#e5dfd3]'
                          : 'bg-slate-900 text-white border-slate-700'
                      }`}
                    >
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          className={`p-3 border-t transition-colors ${
            isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-900/50'
          }`}
        >
          {isExpanded ? (
            /* Expanded Full Profile Info (Logout moved to topbar menu) */
            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-white border-slate-100 shadow-md shadow-slate-200/40' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className={`font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  {user?.name || 'Administrator'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {user?.email || 'mrrashidsaikh0365@gmail.com'}
              </p>
            </div>
          ) : (
            /* Collapsed Rail Footer: Centered Avatar */
            <div className="flex flex-col items-center py-1">
              <div
                title={`${user?.name || 'Administrator'} (${user?.email || ''})`}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#080809] font-black text-xs shadow-md cursor-default ring-2 ring-[#d8b056]/60"
                style={{
                  background: 'linear-gradient(135deg, #e4c775 0%, #d8b056 45%, #c89b3c 100%)',
                  boxShadow: '0 4px 14px -2px rgba(200, 155, 60, 0.4)',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'H'}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950"></span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Topbar */}
        <header
          className={`hidden md:flex items-center justify-between px-8 py-4 backdrop-blur border-b sticky top-0 z-30 transition-colors ${
            isLight
              ? 'bg-white/95 border-slate-100 shadow-sm'
              : 'bg-slate-900/60 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <h2 className={`text-base font-bold capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {cleanPath === '/' ? 'Overview' : cleanPath.replace('/', '').replace('-', ' ')}
            </h2>
            <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>/</span>
            <span className="text-xs text-amber-500 font-semibold tracking-wide">HopeFairy Engine</span>
          </div>

          <div className="flex items-center gap-3">
            <AdminThemeToggle />
            <AdminUserMenu user={user} />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 sm:p-6 md:p-8 flex-1">
          {children}
        </main>

        {/* Slim Compact Admin Footer */}
        <footer
          className={`py-3.5 px-6 border-t text-center text-xs transition-colors shrink-0 ${
            isLight
              ? 'bg-white border-slate-100 text-slate-500'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
            <span>
              &copy; {new Date().getFullYear()} <strong className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>HopeFairy</strong>. All rights reserved.
            </span>
            <span className={`hidden sm:inline ${isLight ? 'text-slate-300' : 'text-slate-700'}`}>•</span>
            <span className="flex items-center gap-1">
              <span>Designed &amp; Developed by</span>
              <a
                href="https://areezsoftware.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-500 hover:text-amber-600 hover:underline transition-colors"
                title="Areez Software — Websites, Apps & Custom Software"
              >
                Areez Software
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}
