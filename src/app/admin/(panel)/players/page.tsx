import { DeleteButton, Field, inputClass, Notice, SaveButton } from "@/components/admin";
import { getPlayers } from "@/lib/data";
import type { Player } from "@/types";
import { deletePlayer, savePlayer } from "../../actions";

export const metadata = { title: "Players | Admin" };

function PlayerForm({ player }: { player?: Player }) {
  return (
    <form action={savePlayer} encType="multipart/form-data" className="grid gap-4 sm:grid-cols-3">
      <input type="hidden" name="original" defaultValue={player ? String(player.number) : ""} />
      <div className="sm:col-span-2">
        <Field label="Name">
          <input name="name" required defaultValue={player?.name} className={inputClass} />
        </Field>
      </div>
      <Field label="Shirt number">
        <input name="number" type="number" min={1} max={99} required defaultValue={player?.number} className={inputClass} />
      </Field>
      <Field label="Position">
        <select name="position" defaultValue={player?.position ?? "MID"} className={inputClass}>
          <option value="GK">Goalkeeper</option>
          <option value="DEF">Defender</option>
          <option value="MID">Midfielder</option>
          <option value="FWD">Forward</option>
        </select>
      </Field>
      <Field label="Team">
        <select name="team" defaultValue={player?.team ?? "first"} className={inputClass}>
          <option value="first">First team</option>
          <option value="reserves">Reserves</option>
        </select>
      </Field>
      <Field label="Age">
        <input name="age" type="number" min={15} max={50} defaultValue={player?.age} className={inputClass} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Goals">
          <input name="goals" type="number" min={0} defaultValue={player?.goals ?? 0} className={inputClass} />
        </Field>
        <Field label="Assists">
          <input name="assists" type="number" min={0} defaultValue={player?.assists ?? 0} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-3">
        <Field label="Photo (JPG, PNG or WebP, up to 3 MB)">
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} />
        </Field>
        {player?.photo && (
          <div className="mt-2 flex items-center gap-3 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={player.photo} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <label className="flex items-center gap-2">
              <input type="checkbox" name="removePhoto" /> Remove this photo
            </label>
          </div>
        )}
      </div>
      <div className="flex gap-3 sm:col-span-3">
        <SaveButton>{player ? "Save changes" : "Add player"}</SaveButton>
        {player && <DeleteButton action={deletePlayer} />}
      </div>
    </form>
  );
}

export default async function PlayersAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const players = getPlayers().sort(
    (a, b) => Number(a.team === "reserves") - Number(b.team === "reserves") || a.number - b.number,
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Players</h1>
      <div className="mt-4"><Notice saved={saved} error={error} /></div>

      <details className="rounded-xl bg-white p-5 shadow-sm">
        <summary className="cursor-pointer font-bold">Add a player</summary>
        <div className="mt-4"><PlayerForm /></div>
      </details>

      <ul className="mt-6 space-y-3">
        {players.map((p) => (
          <li key={p.number}>
            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer">
                <span className="font-bold">{p.number}. {p.name}</span>
                <span className="ml-3 text-sm text-slate">
                  {p.team === "reserves" ? "Reserves" : "First team"} · {p.position} · {p.goals} goals · {p.assists} assists
                </span>
              </summary>
              <div className="mt-4"><PlayerForm player={p} /></div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
