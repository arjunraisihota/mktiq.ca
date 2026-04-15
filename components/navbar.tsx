import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-edge/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          mktIQ
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-stone md:gap-6">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <a href="#cities" className="transition hover:text-ink">
            Cities
          </a>
        </nav>
      </div>
    </header>
  );
}
