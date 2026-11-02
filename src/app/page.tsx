import Link from "next/link";
import Crest from "@/components/Crest";
import MatchRow from "@/components/MatchRow";
import StandingsTable from "@/components/StandingsTable";
import LiveRefresh from "@/components/LiveRefresh";
import { formatDate, formatLongDate, formatTime, getNews, getStandings, liveMatches, results, upcoming } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Home() {
  const live = liveMatches()[0];
  const next = upcoming()[0];
  const recent = results().slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute -right-8 top-1/2 hidden -translate-y-1/2 opacity-20 md:block">
          <Crest className="h-[26rem] w-auto" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          {live && <LiveRefresh />}
          <p className="mb-3 font-semibold text-flare">{live ? "Live now" : "Next match"}</p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl">
            Ascindrix FC
            {(live ?? next) && (<><br />v {(live ?? next)!.opponent}</>)}
          </h1>
          {live?.score && (
            <p className="mt-4 font-display text-5xl font-extrabold text-flare">
              {live.home ? live.score.for : live.score.against} – {live.home ? live.score.against : live.score.for}
            </p>
          )}
          {live && (
            <Link href={`/fixtures/${live.id}`} className="mt-4 inline-block rounded-full bg-loss px-6 py-3 font-bold text-white hover:brightness-110">
              Follow the match
            </Link>
          )}
          {!live && !next && (
            <p className="mt-6 max-w-prose text-lg text-white/80">
              No upcoming fixtures at the moment. Check back soon for the next match.
            </p>
          )}
          {!live && next && (
            <p className="mt-6 max-w-prose text-lg text-white/80">
              {formatDate(next.date)}, {formatTime(next.date)} at {next.venue}. {next.competition} fixture.
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/fixtures" className="rounded-full bg-flare px-6 py-3 font-bold text-ink hover:brightness-95">
              See all fixtures
            </Link>
            <Link href="/table" className="rounded-full border border-white/40 px-6 py-3 font-bold hover:bg-white/10">
              View league table
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-extrabold">Recent results</h2>
          <ul className="mt-2">{recent.map((m) => <MatchRow key={m.id} match={m} />)}</ul>
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl font-extrabold">Standings</h2>
          <StandingsTable rows={getStandings()} />
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="font-display text-2xl font-extrabold">Latest news</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {getNews().slice(0, 3).map((a) => (
            <Link key={a.slug} href={`/news/${a.slug}`} className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md">
              {a.image && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt="" className="mb-3 aspect-video w-full rounded-lg object-cover" />
                </>
              )}
              <p className="text-sm text-slate">{formatLongDate(a.date)}</p>
              <h3 className="mt-1 font-display text-lg font-bold">{a.title}</h3>
              <p className="mt-2 text-sm text-slate">{a.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
