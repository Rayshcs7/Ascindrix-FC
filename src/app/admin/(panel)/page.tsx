import Link from "next/link";
import { formatDate, formatLongDate, getMatches, getNews, getPlayers, liveMatches, pendingMatches, results, upcoming } from "@/lib/data";

export const metadata = { title: "Dashboard | Ascindrix FC" };

export default function Dashboard() {
  const next = upcoming()[0];
  const played = results();
  const wins = played.filter((m) => m.score && m.score.for > m.score.against).length;
  const goals = getPlayers().reduce((t, p) => t + p.goals, 0);
  const latest = getNews()[0];
  const live = liveMatches()[0];
  const pending = pendingMatches();

  const stats = [
    { label: "Matches", value: getMatches().length, href: "/admin/matches" },
    { label: "Wins", value: wins, href: "/admin/matches" },
    { label: "Players", value: getPlayers().length, href: "/admin/players" },
    { label: "Squad goals", value: goals, href: "/admin/players" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
      {live && (
        <Link href={`/admin/matches/${live.id}`} className="mt-6 block rounded-xl bg-loss p-5 font-bold text-white hover:brightness-110">
          LIVE now: Ascindrix FC v {live.opponent}. Open the match centre to log events.
        </Link>
      )}
      {pending.length > 0 && (
        <Link href="/admin/matches" className="mt-6 block rounded-xl bg-flare p-5 font-bold text-ink hover:brightness-95">
          {pending.length === 1
            ? `1 match needs a result: ${pending[0].home ? "Ascindrix FC v " + pending[0].opponent : pending[0].opponent + " v Ascindrix FC"}.`
            : `${pending.length} past matches need a result.`}{" "}
          Open fixtures and results to enter the score.
        </Link>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md">
            <div className="font-display text-4xl font-extrabold">{s.value}</div>
            <div className="text-sm text-slate">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-ink p-6 text-white">
          <h2 className="font-display text-xl font-bold">Next match</h2>
          {next ? (
            <p className="mt-2 text-white/90">
              {next.home ? "Ascindrix FC v " + next.opponent : next.opponent + " v Ascindrix FC"}
              <br />
              {formatDate(next.date)}, {next.venue}
            </p>
          ) : (
            <p className="mt-2 text-white/80">No upcoming fixtures. Add one under Fixtures and results.</p>
          )}
        </section>
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold">Latest news</h2>
          {latest ? (
            <p className="mt-2">
              {latest.title}
              <span className="block text-sm text-slate">{formatLongDate(latest.date)}</span>
            </p>
          ) : (
            <p className="mt-2 text-slate">No articles yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
