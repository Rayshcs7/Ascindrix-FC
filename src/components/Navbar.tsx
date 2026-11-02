import Link from "next/link";
import Crest from "./Crest";

const links = [
  { href: "/fixtures", label: "Fixtures" },
  { href: "/squad", label: "Squad" },
  { href: "/table", label: "Table" },
  { href: "/news", label: "News" },
  { href: "/tickets", label: "Tickets" },
];

export default function Navbar() {
  return (
    <header className="bg-ink text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3 font-display text-xl font-extrabold tracking-tight">
          <Crest className="h-9 w-auto" />
          <span>
            Ascindrix <span className="text-flare">FC</span>
          </span>
        </Link>
        <ul className="flex gap-4 text-sm sm:gap-6 font-semibold">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="py-2 transition-colors hover:text-flare">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
