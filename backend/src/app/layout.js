import './globals.css';

export const metadata = {
  title: 'HopeFairy Admin Portal | Executive Management Suite',
  description: 'Executive Control Hub & CRM Portal for HopeFairy Education Advisory.',
  robots: { index: false, follow: false },
  // served by the website deployment (same domain)
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
