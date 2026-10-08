import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign In' };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden"
      style={{
        backgroundColor: '#0b1230',
        backgroundImage: 'radial-gradient(ellipse at 12% 8%, rgba(45, 106, 222, 0.42), transparent 42%), radial-gradient(ellipse at 88% 90%, rgba(101, 71, 195, 0.38), transparent 44%)',
      }}
    >
      {children}
    </div>
  );
}
