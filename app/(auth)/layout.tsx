import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign In' };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="login-canvas relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {children}
    </div>
  );
}
