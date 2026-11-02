import { formatDate, formatTime, upcoming } from "@/lib/data";

export const metadata = { title: "Tickets and contact | Ascindrix FC" };

const tiers = [
  { name: "Adult", price: "KES 800", note: "General admission" },
  { name: "Concession", price: "KES 400", note: "Students and over-60s" },
  { name: "Under 12", price: "KES 100", note: "Must be with an adult" },
];

export default function TicketsPage() {
  const nextHome = upcoming().find((m) => m.home);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-4xl font-extrabold">Tickets and contact</h1>

      {nextHome && (
        <p className="mt-4 text-lg">
          Next home game: Ascindrix FC v {nextHome.opponent}, {formatDate(nextHome.date)} at {formatTime(nextHome.date)}, {nextHome.venue}.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className="rounded-xl bg-ink p-6 text-white">
            <h2 className="font-display text-xl font-bold">{t.name}</h2>
            <p className="mt-2 font-display text-3xl font-extrabold text-flare">{t.price}</p>
            <p className="mt-1 text-sm text-white/70">{t.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate">Prices are placeholders. Replace them with your real ticket prices.</p>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">Contact the club</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Ticket enquiries</dt>
            <dd><a className="text-ink-soft underline" href="mailto:tickets@ascindrixfc.example">tickets@ascindrixfc.example</a></dd>
          </div>
          <div>
            <dt className="font-semibold">General enquiries</dt>
            <dd><a className="text-ink-soft underline" href="mailto:info@ascindrixfc.example">info@ascindrixfc.example</a></dd>
          </div>
          <div>
            <dt className="font-semibold">Ground</dt>
            <dd>Ember Park (add your address here)</dd>
          </div>
          <div>
            <dt className="font-semibold">Box office hours</dt>
            <dd>Match days, from two hours before kick-off</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
