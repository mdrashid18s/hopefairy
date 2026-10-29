'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from '../../theme/ThemeContext.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Background from '../ui/Background.jsx';
import ScrollProgress from '../common/ScrollProgress.jsx';
import BackToTop from '../ui/BackToTop.jsx';
import Cursor from '../common/Cursor.jsx';
import WhatsAppButton from '../ui/WhatsAppButton.jsx';

export const ShellContext = createContext({
  hideChrome: false,
  setHideChrome: () => {},
});

export function useShell() {
  return useContext(ShellContext);
}

/**
 * Client-side chrome around every route. Next's App Router restores scroll
 * position on navigation itself, so unlike the old Vite/React-Router build
 * there's no separate <ScrollToTop>.
 */
export default function AppShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [hideChrome, setHideChrome] = useState(false);

  // Automatically reset chrome visibility on route changes
  useEffect(() => {
    setHideChrome(false);
  }, [pathname]);

  const isNotFound = pathname === '/404' || pathname === '/404/' || hideChrome;

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <ShellContext.Provider value={{ hideChrome, setHideChrome }}>
      <ThemeProvider>
        <Cursor />
        {!isNotFound && <Background />}
        {!isNotFound && <ScrollProgress />}
        {!isNotFound && <BackToTop />}
        {!isNotFound && <WhatsAppButton />}
        {!isNotFound && <Navbar />}
        <main className={`w-full max-w-full overflow-x-hidden ${isNotFound ? '' : 'min-h-screen'}`}>
          {/* initial={false}: the first page renders visible straight from the HTML (no wait for JS);
              the fade only plays on route changes */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-full overflow-x-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        {!isNotFound && <Footer />}
      </ThemeProvider>
    </ShellContext.Provider>
  );
}
