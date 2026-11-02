import Link from "next/link";
import type { Match } from "@/types";
import { formatDate, formatTime, isFinished, isLive, isPending, outcome } from "@/lib/data";

const badge = {
  W: "bg-win text-white",
  D: "bg-slate text-white",
  L: "bg-loss text-white",
};

export default function MatchRow({ match }: { match: Match }) {
  const finished = isFinished(match);
  const live = isLive(match);
  const result = finished ? outcome(match) : null;
  const home = match.home ? "Ascindrix FC" : match.opponent;
  const away = match.home ? match.opponent : "Ascindrix FC";
  const s = match.score;
  const showScore = Boolean(s) && (finished || live);
  const scoreText = s ? `${match.home ? s.for : s.against} – ${match.home ? s.against : s.for}` : "";

  return (
    <li className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 border-b border-ink/10 py-4 sm:grid-cols-[7rem_1fr_6rem_auto]">
      <div className="text-sm">
        <div className="font-semibold">{formatDate(match.date)}</div>
        <div className="text-slate">{match.competition}</div>
      </div>
      <div className="font-display text-base font-bold sm:text-lg">
        <Link href={`/fixtures/${match.id}`} className="hover:text-ink-soft hover:underline">
          {home} <span className="font-normal text-slate">v</span> {away}
        </Link>
        <div className="font-sans text-sm font-normal text-slate">{match.venue}</div>
        {showScore && <div className="font-display text-base font-extrabold sm:hidden">{scoreText}</div>}
      </div>
      <div className="hidden text-center font-display text-xl font-extrabold sm:block">
        {showScore ? scoreText : formatTime(match.date)}
      </div>
      {live ? (
        <span className="rounded-full bg-loss px-2.5 py-1 text-xs font-bold text-white">LIVE</span>
      ) : result ? (
        <span
          className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${badge[result]}`}
          aria-label={`Result: ${result}`}
        >
          {result}
        </span>
      ) : isPending(match) ? (
        <span className="rounded-full bg-slate/15 px-2.5 py-1 text-xs font-bold text-slate">Result soon</span>
      ) : (
        <span className="w-8" />
      )}
    </li>
  );
}
