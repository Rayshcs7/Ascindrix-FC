import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer, getPlayers, slugify } from "@/lib/data";

const positionName = { GK: "Goalkeeper", DEF: "Defender", MID: "Midfielder", FWD: "Forward" } as const;

export function generateStaticParams() {
  return getPlayers().map((p) => ({ slug: slugify(p.name) }));
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = getPlayer(slug);
  if (!player) notFound();

  const stats = [
    { label: "Goals", value: player.goals },
    { label: "Assists", value: player.assists },
    { label: "Age", value: player.age },
  ];

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <Link href="/squad" className="text-sm text-white/70 hover:text-flare">Back to squad</Link>
          <div className="mt-4 flex flex-wrap items-end gap-6">
            {player.photo && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={player.photo} alt={player.name} className="h-36 w-36 rounded-xl object-cover" />
              </>
            )}
            <span className="font-display text-8xl font-extrabold leading-none text-flare">{player.number}</span>
            <div>
              <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{player.name}</h1>
              <p className="mt-1 text-white/80">{positionName[player.position]}, {player.team === "reserves" ? "Reserves" : "First team"}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-5 py-10">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 text-center shadow-sm">
            <div className="font-display text-4xl font-extrabold">{s.value}</div>
            <div className="text-sm text-slate">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
