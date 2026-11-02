import Link from "next/link";
import Crest from "@/components/Crest";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/matches", label: "Fixtures and results" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/standings", label: "League table" },
  { href: "/admin/news", label: "News" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[14rem_1fr]">
      <aside>
        <div className="mb-4 hidden md:block"><Crest className="h-16 w-auto" /></div>
        <nav aria-label="Admin" className="flex flex-wrap gap-2 md:flex-col">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-flare/40">
              {n.label}
            </Link>
          ))}
          <Link href="/" className="rounded-lg px-4 py-2 text-sm text-slate hover:underline">View public site</Link>
          <form action={logout}>
            <button type="submit" className="rounded-lg px-4 py-2 text-sm text-slate hover:underline">Log out</button>
          </form>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
