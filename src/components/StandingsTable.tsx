import type { StandingRow } from "@/types";

export default function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead className="text-slate">
          <tr className="border-b-2 border-ink">
            <th className="py-2 pr-2 font-semibold">#</th>
            <th className="py-2 font-semibold">Team</th>
            {["P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((h) => (
              <th key={h} className="py-2 text-right font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.team} className={`border-b border-ink/10 ${r.isUs ? "bg-flare/30 font-bold" : ""}`}>
              <td className="py-3 pr-2">{i + 1}</td>
              <td className="py-3">{r.team}</td>
              <td className="py-3 text-right">{r.played}</td>
              <td className="py-3 text-right">{r.won}</td>
              <td className="py-3 text-right">{r.drawn}</td>
              <td className="py-3 text-right">{r.lost}</td>
              <td className="py-3 text-right">{r.gf}</td>
              <td className="py-3 text-right">{r.ga}</td>
              <td className="py-3 text-right">{r.gf - r.ga}</td>
              <td className="py-3 text-right font-bold">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
