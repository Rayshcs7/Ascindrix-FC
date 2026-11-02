import MatchRow from "@/components/MatchRow";
import { liveMatches, pendingMatches, results, upcoming } from "@/lib/data";
import LiveRefresh from "@/components/LiveRefresh";

export const metadata = { title: "Fixtures and results | Ascindrix FC" };

export const dynamic = "force-dynamic";

export default function FixturesPage() {
  const live = liveMatches();
  const pending = pendingMatches();
  const next = upcoming();
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      {live.length > 0 && <LiveRefresh />}
      <h1 className="font-display text-4xl font-extrabold">Fixtures and results</h1>

      {live.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-2xl font-bold">Live now</h2>
          <ul>{live.map((m) => <MatchRow key={m.id} match={m} />)}</ul>
        </>
      )}

      <h2 className="mt-10 font-display text-2xl font-bold">Upcoming</h2>
      {next.length > 0 ? (
        <ul>{next.map((m) => <MatchRow key={m.id} match={m} />)}</ul>
      ) : (
        <p className="mt-3 text-slate">No upcoming fixtures right now.</p>
      )}

      {pending.length > 0 && (
        <>
          <h2 className="mt-12 font-display text-2xl font-bold">Awaiting result</h2>
          <ul>{pending.map((m) => <MatchRow key={m.id} match={m} />)}</ul>
        </>
      )}

      <h2 className="mt-12 font-display text-2xl font-bold">Results</h2>
      <ul>{results().map((m) => <MatchRow key={m.id} match={m} />)}</ul>
    </div>
  );
}
