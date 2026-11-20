import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-white">
      <h2 className="text-3xl font-extrabold text-[#082B50] mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-600 mb-6">The page you requested could not be found.</p>
      <Link
        href="/"
        className="bg-[#F15A24] text-white font-bold px-6 py-2.5 rounded-full text-sm"
      >
        Return Home
      </Link>
    </div>
  );
}

