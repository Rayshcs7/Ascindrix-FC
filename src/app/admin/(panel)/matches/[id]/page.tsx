import Link from "next/link";
import { notFound } from "next/navigation";
import { Field, inputClass, Notice, SaveButton } from "@/components/admin";
import {
  formatDate, getMatch, getPlayers, isLive, playerByNumber, sortEvents, statusLabel,
} from "@/lib/data";
import type { MatchEvent, Player } from "@/types";
import { addEvent, deleteEvent, saveLineup, setMatchStatus } from "../../../match-actions";

export const metadata = { title: "Match centre | Admin" };
export const dynamic = "force-dynamic";

const statusButtons = [
  { status: "first_half", label: "Kick off" },
  { status: "half_time", label: "Half time" },
  { status: "second_half", label: "Start second half" },
  { status: "full_time", label: "Full time" },
] as const;

function eventSummary(e: MatchEvent) {
  const mine = (n?: number) => playerByNumber(n)?.name ?? "?";
  const who = e.side === "us" ? mine(e.player) : e.name || "Opponent";
  const labels: Record<string, string> = {
    kickoff: "Kick-off", halftime: "Half time", secondhalf: "Second half begins", fulltime: "Full time",
  };
  if (labels[e.type]) return labels[e.type];
  if (e.type === "goal") return `Goal: ${who}${e.side === "us" && e.player2 !== undefined ? ` (assist ${mine(e.player2)})` : ""}${e.side === "them" ? " (opponent)" : ""}`;
  if (e.type === "own_goal") return `Own goal: ${who}`;
  if (e.type === "yellow") return `Yellow card: ${who}`;
  if (e.type === "red") return `Red card: ${who}`;
  if (e.type === "sub") return `Substitution: ${mine(e.player2)} on, ${mine(e.player)} off`;
  return `Note: ${e.note}`;
}

export default async function MatchCentre({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const match = getMatch(id);
  if (!match) notFound();

  const players = getPlayers().sort(
    (a, b) => Number(a.team === "reserves") - Number(b.team === "reserves") || a.number - b.number,
  );
  const inLineup = new Set([...(match.lineup?.starting ?? []), ...(match.lineup?.bench ?? [])]);
  const eventPlayers: Player[] = match.lineup ? players.filter((p) => inLineup.has(p.number)) : players;
  const events = sortEvents(match.events);
  const title = match.home ? `Ascindrix FC v ${match.opponent}` : `${match.opponent} v Ascindrix FC`;
  const label = (p: Player) => `#${p.number} ${p.name}`;

  const playerSelect = (name: string, blank: string) => (
    <select name={name} defaultValue="" className={inputClass}>
      <option value="">{blank}</option>
      {eventPlayers.map((p) => (
        <option key={p.number} value={p.number}>{label(p)}</option>
      ))}
    </select>
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/matches" className="text-sm text-slate hover:underline">Back to fixtures and results</Link>
        <h1 className="mt-2 font-display text-3xl font-extrabold">{title}</h1>
        <p className="text-slate">{formatDate(match.date)} · {match.competition} · {match.venue}</p>
        <p className="mt-3 text-lg font-bold">
          {isLive(match) && <span className="mr-2 rounded-full bg-loss px-2.5 py-0.5 text-xs text-white">LIVE</span>}
          {statusLabel(match)}
          {match.score && (
            <span className="ml-3 font-display text-2xl">
              Ascindrix {match.score.for} – {match.score.against} {match.opponent}
            </span>
          )}
        </p>
        <Link href={`/fixtures/${match.id}`} className="text-sm underline">View public match page</Link>
      </div>

      <Notice saved={saved} error={error} />

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold">1. Match status</h2>
        <p className="mt-1 text-sm text-slate">Press these as the match goes. Each one is logged in the timeline automatically.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {statusButtons.map((b) => (
            <form key={b.status} action={setMatchStatus}>
              <input type="hidden" name="matchId" value={match.id} />
              <input type="hidden" name="status" value={b.status} />
              <button
                type="submit"
                className={`rounded-full px-5 py-2 text-sm font-bold ${
                  match.status === b.status ? "bg-flare text-ink" : "bg-ink text-white hover:bg-ink-soft"
                }`}
              >
                {b.label}
              </button>
            </form>
          ))}
          <form action={setMatchStatus}>
            <input type="hidden" name="matchId" value={match.id} />
            <input type="hidden" name="status" value="scheduled" />
            <button type="submit" className="rounded-full border border-ink/30 px-5 py-2 text-sm font-bold hover:bg-chalk">
              Reset match (clears events and score)
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold">2. Lineup</h2>
        <p className="mt-1 text-sm text-slate">Choose up to 11 starters and any number of substitutes, from the first team and reserves.</p>
        <form action={saveLineup} className="mt-4">
          <input type="hidden" name="matchId" value={match.id} />
          <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2">
            {players.map((p) => {
              const current = match.lineup?.starting.includes(p.number)
                ? "start" : match.lineup?.bench.includes(p.number) ? "bench" : "";
              return (
                <li key={p.number} className="flex items-center justify-between gap-3 border-b border-ink/10 py-1.5">
                  <label htmlFor={`p_${p.number}`} className="text-sm">
                    <span className="font-bold">#{p.number}</span> {p.name}
                    <span className="text-slate"> · {p.position}{p.team === "reserves" ? " · Reserves" : ""}</span>
                  </label>
                  <select id={`p_${p.number}`} name={`p_${p.number}`} defaultValue={current} className="rounded-lg border border-ink/20 bg-white px-2 py-1 text-sm">
                    <option value="">Not in squad</option>
                    <option value="start">Starting XI</option>
                    <option value="bench">Substitute</option>
                  </select>
                </li>
              );
            })}
          </ul>
          <div className="mt-4"><SaveButton>Save lineup</SaveButton></div>
        </form>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold">3. Log an event</h2>
        <p className="mt-1 text-sm text-slate">
          Goals update the score by themselves. For a substitution, pick the player coming off in the first box and the player coming on in the second.
          {!match.lineup && " Save a lineup first to shorten the player lists."}
        </p>
        <form action={addEvent} className="mt-4 grid gap-4 sm:grid-cols-3">
          <input type="hidden" name="matchId" value={match.id} />
          <Field label="What happened">
            <select name="type" defaultValue="goal" className={inputClass}>
              <option value="goal">Goal</option>
              <option value="own_goal">Own goal</option>
              <option value="yellow">Yellow card</option>
              <option value="red">Red card</option>
              <option value="sub">Substitution (Ascindrix)</option>
              <option value="note">Note (e.g. opponent substitution)</option>
            </select>
          </Field>
          <Field label="Which team">
            <select name="side" defaultValue="us" className={inputClass}>
              <option value="us">Ascindrix FC</option>
              <option value="them">{match.opponent}</option>
            </select>
          </Field>
          <Field label="Minute">
            <input name="minute" type="number" min={0} max={130} required className={inputClass} />
          </Field>
          <Field label="Ascindrix player (scorer, carded, or coming off)">{playerSelect("player", "None")}</Field>
          <Field label="Second player (assist, or coming on)">{playerSelect("player2", "None")}</Field>
          <Field label="Opponent player name">
            <input name="name" placeholder="Only for opponent events" className={inputClass} />
          </Field>
          <div className="sm:col-span-3">
            <Field label="Note (optional)">
              <input name="note" className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-3"><SaveButton>Add to timeline</SaveButton></div>
        </form>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold">Timeline</h2>
        {events.length === 0 ? (
          <p className="mt-2 text-slate">Nothing logged yet.</p>
        ) : (
          <ul className="mt-3">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 border-b border-ink/10 py-2">
                <span className="w-12 font-display text-lg font-extrabold">{e.minute}&apos;</span>
                <span className="flex-1">{eventSummary(e)}</span>
                <form action={deleteEvent}>
                  <input type="hidden" name="matchId" value={match.id} />
                  <input type="hidden" name="eventId" value={e.id} />
                  <button type="submit" className="text-sm font-semibold text-loss hover:underline">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
