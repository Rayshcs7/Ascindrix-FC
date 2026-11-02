import { DeleteButton, Field, inputClass, Notice, SaveButton } from "@/components/admin";
import { getStandings, OUR_TEAM } from "@/lib/data";
import type { StandingRow } from "@/types";
import { deleteStanding, saveStanding } from "../../actions";

export const metadata = { title: "League table | Admin" };

function StandingForm({ row }: { row?: StandingRow }) {
  const num = (name: string, label: string, value?: number) => (
    <Field label={label}>
      <input name={name} type="number" min={0} defaultValue={value ?? 0} className={inputClass} />
    </Field>
  );
  return (
    <form action={saveStanding} className="grid gap-4 sm:grid-cols-5">
      <input type="hidden" name="original" defaultValue={row?.team ?? ""} />
      <div className="sm:col-span-5">
        <Field label="Team">
          <input name="team" required defaultValue={row?.team} className={inputClass} />
        </Field>
      </div>
      {num("won", "Won", row?.won)}
      {num("drawn", "Drawn", row?.drawn)}
      {num("lost", "Lost", row?.lost)}
      {num("gf", "Goals for", row?.gf)}
      {num("ga", "Goals against", row?.ga)}
      <p className="text-sm text-slate sm:col-span-5">
        Played and points are worked out for you (3 points for a win, 1 for a draw).
        {row?.team === OUR_TEAM && " Renaming this team stops it being highlighted as yours."}
      </p>
      <div className="flex gap-3 sm:col-span-5">
        <SaveButton>{row ? "Save changes" : "Add team"}</SaveButton>
        {row && <DeleteButton action={deleteStanding} />}
      </div>
    </form>
  );
}

export default async function StandingsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const rows = getStandings();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">League table</h1>
      <div className="mt-4"><Notice saved={saved} error={error} /></div>

      <details className="rounded-xl bg-white p-5 shadow-sm">
        <summary className="cursor-pointer font-bold">Add a team</summary>
        <div className="mt-4"><StandingForm /></div>
      </details>

      <ul className="mt-6 space-y-3">
        {rows.map((r, i) => (
          <li key={r.team}>
            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer">
                <span className="font-bold">{i + 1}. {r.team}</span>
                <span className="ml-3 text-sm text-slate">
                  P{r.played} W{r.won} D{r.drawn} L{r.lost} · GD {r.gf - r.ga} · {r.points} pts
                </span>
              </summary>
              <div className="mt-4"><StandingForm row={r} /></div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
