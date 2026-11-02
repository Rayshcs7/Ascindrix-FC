import Link from "next/link";
import { getPlayers, slugify } from "@/lib/data";
import type { Player, Position } from "@/types";

export const metadata = { title: "Squad | Ascindrix FC" };

const groups: { pos: Position; label: string }[] = [
  { pos: "GK", label: "Goalkeepers" },
  { pos: "DEF", label: "Defenders" },
  { pos: "MID", label: "Midfielders" },
  { pos: "FWD", label: "Forwards" },
];

const teams = [
  { key: "first", label: "First team" },
  { key: "reserves", label: "Reserves" },
] as const;

function PlayerCard({ p }: { p: Player }) {
  return (
    <article className="rounded-xl bg-ink p-5 text-white">
      {p.photo && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.photo} alt="" className="mb-3 aspect-square w-full rounded-lg object-cover" />
        </>
      )}
      <div className="font-display text-5xl font-extrabold text-flare">{p.number}</div>
      <h4 className="mt-2 font-display text-lg font-bold">
        <Link href={`/squad/${slugify(p.name)}`} className="hover:text-flare hover:underline">{p.name}</Link>
      </h4>
      <p className="text-sm text-white/70">Age {p.age}</p>
      <p className="mt-3 text-sm">{p.goals} goals, {p.assists} assists</p>
    </article>
  );
}

export default function SquadPage() {
  const players = getPlayers();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-4xl font-extrabold">Squad</h1>
      {teams.map(({ key, label }) => {
        const squad = players.filter((p) => (p.team ?? "first") === key).sort((a, b) => a.number - b.number);
        if (squad.length === 0) return null;
        return (
          <section key={key} className="mt-12">
            <h2 className="border-b-4 border-flare pb-2 font-display text-3xl font-extrabold">
              {label} <span className="text-lg font-semibold text-slate">({squad.length} players)</span>
            </h2>
            {groups.map(({ pos, label: groupLabel }) => {
              const inGroup = squad.filter((p) => p.position === pos);
              if (inGroup.length === 0) return null;
              return (
                <div key={pos} className="mt-8">
                  <h3 className="font-display text-xl font-bold">{groupLabel}</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {inGroup.map((p) => <PlayerCard key={p.number} p={p} />)}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
