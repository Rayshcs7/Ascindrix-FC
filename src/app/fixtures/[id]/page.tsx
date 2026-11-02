import Link from "next/link";
import { notFound } from "next/navigation";
import LiveRefresh from "@/components/LiveRefresh";
import MatchTimeline from "@/components/MatchTimeline";
import {
  formatDate, formatTime, getMatch, goalScorers, involvement, isFinished, isLive, isPending,
  outcome, resolveLineup, slugify, statusLabel,
} from "@/lib/data";
import type { Player } from "@/types";

export const dynamic = "force-dynamic"; // always show the latest events

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();

  const live = isLive(match);
  const finished = isFinished(match);
  const started = live || finished;
  const s = match.score;
  const result = finished ? outcome(match) : null;
  const home = match.home ? "Ascindrix FC" : match.opponent;
  const away = match.home ? match.opponent : "Ascindrix FC";
  const { starting, bench, custom } = resolveLineup(match);
  const inv = involvement(match);
  const scorers = goalScorers(match);
  const hasScorers = scorers.mine.length + scorers.theirs.length > 0;

  const PlayerLine = ({ p }: { p: Player }) => (
    <li className="flex flex-wrap items-center gap-x-3 border-b border-ink/10 py-2">
      <span className="w-8 font-display text-lg font-extrabold text-ink-soft">{p.number}</span>
      <Link href={`/squad/${slugify(p.name)}`} className="font-semibold hover:underline">{p.name}</Link>
      <span className="text-xs text-slate">{p.team === "reserves" ? "Reserves" : ""}</span>
      <span className="ml-auto flex flex-wrap gap-1.5 text-xs font-bold">
        {inv.goals.has(p.number) && (
          <span className="rounded-full bg-win px-2 py-0.5 text-white">
            {inv.goals.get(p.number)! > 1 ? `${inv.goals.get(p.number)} goals` : "Goal"}
          </span>
        )}
        {inv.yellow.has(p.number) && <span className="rounded-full bg-flare px-2 py-0.5 text-ink">Yellow</span>}
        {inv.red.has(p.number) && <span className="rounded-full bg-loss px-2 py-0.5 text-white">Red</span>}
        {inv.off.has(p.number) && (
          <span className="rounded-full bg-slate px-2 py-0.5 text-white">Off {inv.off.get(p.number)}&apos;</span>
        )}
        {inv.on.has(p.number) && (
          <span className="rounded-full bg-ink-soft px-2 py-0.5 text-white">On {inv.on.get(p.number)}&apos;</span>
        )}
        <span className="text-slate">{p.position}</span>
      </span>
    </li>
  );

  return (
    <div>
      {live && <LiveRefresh />}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <Link href="/fixtures" className="text-sm text-white/70 hover:text-flare">Back to fixtures</Link>
          <p className="mt-4 text-white/80">
            {match.competition}, {formatDate(match.date)}, {match.venue}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-5xl">
            {home} v {away}
          </h1>
          <p className="mt-4 font-display text-6xl font-extrabold text-flare">
            {started && s ? `${match.home ? s.for : s.against} – ${match.home ? s.against : s.for}` : formatTime(match.date)}
          </p>
          <p className="mt-2 flex items-center gap-3 text-white/90">
            {live && <span className="rounded-full bg-loss px-2.5 py-0.5 text-xs font-bold text-white">LIVE</span>}
            {started || isPending(match) ? statusLabel(match) : `Kick-off ${formatTime(match.date)}`}
            {result && (
              <span>
                · {result === "W" ? "Ascindrix FC won" : result === "D" ? "Ended in a draw" : "Ascindrix FC lost"}
              </span>
            )}
          </p>
          {hasScorers && (
            <p className="mt-3 max-w-prose text-sm text-white/80">
              <span className="font-semibold text-white">Ascindrix FC:</span> {scorers.mine.join(", ") || "none"}
              <br />
              <span className="font-semibold text-white">{match.opponent}:</span> {scorers.theirs.join(", ") || "none"}
            </p>
          )}
          {live && <p className="mt-3 text-sm text-white/70">This page updates automatically.</p>}
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 px-5 py-12">
        <MatchTimeline match={match} />

        <div className="grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl font-bold">Starting XI</h2>
            <ul className="mt-3">{starting.map((p) => <PlayerLine key={p.number} p={p} />)}</ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold">Substitutes</h2>
            <ul className="mt-3">{bench.map((p) => <PlayerLine key={p.number} p={p} />)}</ul>
            {!custom && (
              <p className="mt-4 text-sm text-slate">The lineup for this match hasn&apos;t been announced yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
