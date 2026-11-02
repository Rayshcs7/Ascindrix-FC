import type { Match, MatchEvent } from "@/types";
import { playerByNumber, sortEvents } from "@/lib/data";

const statusText: Record<string, string> = {
  kickoff: "Kick-off",
  halftime: "Half time",
  secondhalf: "Second half begins",
  fulltime: "Full time",
};

const tag: Record<string, { label: string; cls: string }> = {
  goal: { label: "Goal", cls: "bg-win text-white" },
  own_goal: { label: "Own goal", cls: "bg-win text-white" },
  yellow: { label: "Yellow", cls: "bg-flare text-ink" },
  red: { label: "Red", cls: "bg-loss text-white" },
  sub: { label: "Sub", cls: "bg-ink-soft text-white" },
  note: { label: "Note", cls: "bg-slate text-white" },
};

function describe(e: MatchEvent) {
  const mine = (n?: number) => playerByNumber(n)?.name ?? "Unknown player";
  const who = e.side === "us" ? mine(e.player) : e.name || "Opponent player";
  switch (e.type) {
    case "goal":
      return e.side === "us"
        ? `${who}${e.player2 !== undefined ? ` (assist: ${mine(e.player2)})` : ""}`
        : who;
    case "own_goal":
      return `${who} (${e.side === "us" ? "Ascindrix" : "opponent"} player) puts it in his own net`;
    case "yellow":
    case "red":
      return `${who}${e.side === "us" ? "" : " (opponent)"}`;
    case "sub":
      return `${mine(e.player2)} on, ${mine(e.player)} off`;
    default:
      return e.note ?? "";
  }
}

export default function MatchTimeline({ match }: { match: Match }) {
  const events = sortEvents(match.events);
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="timeline">
      <h2 id="timeline" className="font-display text-2xl font-bold">Match events</h2>
      <ol className="mt-3">
        {events.map((e) =>
          statusText[e.type] ? (
            <li key={e.id} className="my-3 flex items-center gap-3 text-sm font-semibold text-slate">
              <span className="h-px flex-1 bg-ink/20" />
              <span>{statusText[e.type]}</span>
              <span className="h-px flex-1 bg-ink/20" />
            </li>
          ) : (
            <li key={e.id} className="flex items-start gap-3 border-b border-ink/10 py-3">
              <span className="w-12 shrink-0 font-display text-lg font-extrabold">{e.minute}&apos;</span>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${tag[e.type]?.cls}`}>
                {tag[e.type]?.label}
              </span>
              <span className="min-w-0">
                <span className={e.side === "us" ? "font-semibold" : ""}>{describe(e)}</span>
                {e.note && e.type !== "note" && <span className="block text-sm text-slate">{e.note}</span>}
              </span>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}
