import Link from "next/link";
import { DeleteButton, Field, inputClass, Notice, SaveButton } from "@/components/admin";
import { formatDate, getMatches, isLive, isPending } from "@/lib/data";
import type { Match } from "@/types";
import { deleteMatch, saveMatch } from "../../actions";

export const metadata = { title: "Fixtures and results | Admin" };

function MatchForm({ match }: { match?: Match }) {
  return (
    <form action={saveMatch} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" defaultValue={match?.id ?? ""} />
      <Field label="Opponent">
        <input name="opponent" required defaultValue={match?.opponent} className={inputClass} />
      </Field>
      <Field label="Date and kick-off time">
        <input name="date" type="datetime-local" required defaultValue={match?.date.slice(0, 16)} className={inputClass} />
      </Field>
      <Field label="Home or away">
        <select name="home" defaultValue={match?.home === false ? "away" : "home"} className={inputClass}>
          <option value="home">Home</option>
          <option value="away">Away</option>
        </select>
      </Field>
      <Field label="Competition">
        <select name="competition" defaultValue={match?.competition ?? "League"} className={inputClass}>
          <option>League</option>
          <option>Cup</option>
          <option>Friendly</option>
        </select>
      </Field>
      <Field label="Venue">
        <input name="venue" defaultValue={match?.venue} className={inputClass} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Ascindrix goals">
          <input name="scoreFor" type="number" min={0} defaultValue={match?.score?.for} className={inputClass} />
        </Field>
        <Field label="Opponent goals">
          <input name="scoreAgainst" type="number" min={0} defaultValue={match?.score?.against} className={inputClass} />
        </Field>
      </div>
      <p className="text-sm text-slate sm:col-span-2">Leave both goal boxes empty for a match that hasn&apos;t been played.</p>
      <div className="flex gap-3 sm:col-span-2">
        <SaveButton>{match ? "Save changes" : "Add match"}</SaveButton>
        {match && <DeleteButton action={deleteMatch} />}
      </div>
    </form>
  );
}

export default async function MatchesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const matches = getMatches().sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Fixtures and results</h1>
      <div className="mt-4"><Notice saved={saved} error={error} /></div>

      <details className="rounded-xl bg-white p-5 shadow-sm">
        <summary className="cursor-pointer font-bold">Add a match</summary>
        <div className="mt-4"><MatchForm /></div>
      </details>

      <ul className="mt-6 space-y-3">
        {matches.map((m) => (
          <li key={m.id}>
            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer">
                <span className="font-bold">{isLive(m) && <span className="mr-2 rounded-full bg-loss px-2 py-0.5 text-xs text-white">LIVE</span>}{m.home ? `Ascindrix FC v ${m.opponent}` : `${m.opponent} v Ascindrix FC`}</span>
                <span className="ml-3 text-sm text-slate">
                  {formatDate(m.date)} · {m.competition} · {m.score ? `${m.score.for}–${m.score.against}` : isPending(m) ? "RESULT NEEDED" : "not played"}
                </span>
              </summary>
              <div className="mt-4">
                <Link href={`/admin/matches/${m.id}`} className="mb-4 inline-block rounded-full bg-flare px-5 py-2 text-sm font-bold text-ink hover:brightness-95">
                  Open match centre (lineup and live events)
                </Link>
                <MatchForm match={m} />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
