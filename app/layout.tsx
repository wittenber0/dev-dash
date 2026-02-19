import './globals.css';
import Nav from '../components/Nav';

export const metadata = {
  title: 'Dashboard',
  description: 'Next.js dashboard foundation with shared layout and navigation'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Nav />
          <main className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
