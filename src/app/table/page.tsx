import StandingsTable from "@/components/StandingsTable";
import { getStandings } from "@/lib/data";

export const metadata = { title: "League table | Ascindrix FC" };

export default function TablePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="mb-6 font-display text-4xl font-extrabold">League table</h1>
      <StandingsTable rows={getStandings()} />
    </div>
  );
}
