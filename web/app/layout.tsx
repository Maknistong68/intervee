import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INTERVEE - Philippine OSH Interview Assistant',
  description: 'AI-powered assistant for Philippine OSH Practitioner interviews. Get instant answers based on DOLE regulations, OSHS Rules, and RA 11058.',
  keywords: ['OSH', 'DOLE', 'Philippines', 'Safety', 'Interview', 'RA 11058', 'OSHS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
