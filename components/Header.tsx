import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold text-lg">
          Dr Muddu TyG Research Dashboard
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="hidden sm:inline">
            Dr Muddu Surendra Nehru | Professor Medicine | HOMA Clinic
          </span>
          <Link href="/" className="hover:text-foreground">Home</Link>
          <Link href="/analyze" className="hover:text-foreground">Analyze</Link>
          <Link href="/export" className="hover:text-foreground">Export</Link>
        </nav>
      </div>
    </header>
  );
}
