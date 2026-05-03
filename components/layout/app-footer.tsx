import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-8 border-t border-violet-100 bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 md:flex-row md:items-center">
        <p>© 2026 GradPilot AI. Built for TenzorX AI Hackathon.</p>

        <div className="flex flex-wrap gap-5">
          <Link href="/dashboard" className="hover:text-violet-700">
            Dashboard
          </Link>
          <Link href="/career-navigator" className="hover:text-violet-700">
            Career Navigator
          </Link>
          <Link href="/loan-engine" className="hover:text-violet-700">
            Loan Engine
          </Link>
          <Link href="/growth-engine" className="hover:text-violet-700">
            Growth Engine
          </Link>
        </div>
      </div>
    </footer>
  );
}
