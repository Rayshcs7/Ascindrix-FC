import type { Match, MatchEvent, Player, StandingEntry, StandingRow } from "@/types";
import { readJson } from "@/lib/store";

export interface Article {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string[];
  image?: string;
}

// Edited through the admin dashboard (data/*.json).
export const getMatches = () => readJson<Match[]>("matches");
export const getPlayers = () => readJson<Player[]>("players");
export const getNews = () =>
  readJson<Article[]>("news").sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const OUR_TEAM = "Ascindrix FC";

// Edited in Admin > Standings. Played and points are calculated (3 for a win, 1 for a draw).
export const getStandings = (): StandingRow[] =>
  readJson<StandingEntry[]>("standings")
    .map((e) => ({
      ...e,
      played: e.won + e.drawn + e.lost,
      points: e.won * 3 + e.drawn,
      isUs: e.team === OUR_TEAM,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.gf - b.ga - (a.gf - a.ga) ||
        b.gf - a.gf ||
        a.team.localeCompare(b.team),
    );

// A match is finished at full time, or (older matches with no status) once it has a score.
export const isFinished = (m: Match) => (m.status ? m.status === "full_time" : Boolean(m.score));
export const isLive = (m: Match) =>
  m.status === "first_half" || m.status === "half_time" || m.status === "second_half";

const byDate = (a: Match, b: Match) => +new Date(a.date) - +new Date(b.date);

// Match times are stored as the club's local wall-clock time (written with a "Z").
// So "now" has to be the club's local wall-clock time too, not UTC.
export const CLUB_TIMEZONE = process.env.CLUB_TIMEZONE || "Africa/Nairobi";

export const clubNow = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLUB_TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
};

// Kick-off has passed but the match isn't live or finished, so the result still needs entering.
export const isPending = (m: Match) =>
  !isFinished(m) && !isLive(m) && +new Date(m.date) <= clubNow();

export const results = () => getMatches().filter(isFinished).sort((a, b) => byDate(b, a));
export const liveMatches = () => getMatches().filter(isLive);
export const pendingMatches = () => getMatches().filter(isPending).sort((a, b) => byDate(b, a));
export const upcoming = () =>
  getMatches().filter((m) => !isFinished(m) && !isLive(m) && !isPending(m)).sort(byDate);

export const statusLabel = (m: Match) => {
  switch (m.status) {
    case "first_half": return "Live: first half";
    case "half_time": return "Half time";
    case "second_half": return "Live: second half";
    case "full_time": return "Full time";
    default: return isFinished(m) ? "Full time" : isPending(m) ? "Result to be confirmed" : "Not started";
  }
};

// ---------- events ----------
export const sortEvents = (events: MatchEvent[] = []) =>
  events.map((e, i) => ({ e, i })).sort((a, b) => a.e.minute - b.e.minute || a.i - b.i).map((x) => x.e);

// An own goal by one side counts for the other.
export const scoreFromEvents = (events: MatchEvent[] = []) => {
  let us = 0;
  let them = 0;
  for (const e of events) {
    if (e.type === "goal") e.side === "us" ? us++ : them++;
    if (e.type === "own_goal") e.side === "us" ? them++ : us++;
  }
  return { for: us, against: them };
};

export const playerByNumber = (n?: number) =>
  n === undefined ? undefined : getPlayers().find((p) => p.number === n);

export const surname = (name: string) => name.split(" ").slice(-1)[0];

export const goalScorers = (m: Match) => {
  const mine: string[] = [];
  const theirs: string[] = [];
  for (const e of sortEvents(m.events)) {
    const who = (e.side === "us" ? playerByNumber(e.player)?.name : e.name) ?? "Unknown";
    if (e.type === "goal") (e.side === "us" ? mine : theirs).push(`${surname(who)} ${e.minute}'`);
    if (e.type === "own_goal") (e.side === "us" ? theirs : mine).push(`${surname(who)} ${e.minute}' (og)`);
  }
  return { mine, theirs };
};

// What happened to each Ascindrix player in this match.
export const involvement = (m: Match) => {
  const off = new Map<number, number>();
  const on = new Map<number, number>();
  const goals = new Map<number, number>();
  const yellow = new Set<number>();
  const red = new Set<number>();
  for (const e of m.events ?? []) {
    if (e.side !== "us" && e.type !== "sub") continue;
    if (e.type === "sub") {
      if (e.player !== undefined) off.set(e.player, e.minute);
      if (e.player2 !== undefined) on.set(e.player2, e.minute);
    }
    if (e.type === "goal" && e.player !== undefined) goals.set(e.player, (goals.get(e.player) ?? 0) + 1);
    if (e.type === "yellow" && e.player !== undefined) yellow.add(e.player);
    if (e.type === "red" && e.player !== undefined) red.add(e.player);
  }
  return { off, on, goals, yellow, red };
};

export const getMatch = (id: string) => getMatches().find((m) => m.id === id);
export const getArticle = (slug: string) => getNews().find((a) => a.slug === slug);

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const getPlayer = (slug: string) => getPlayers().find((p) => slugify(p.name) === slug);

// Uses the lineup saved for the match. Older matches without one fall back to a 4-3-3 from the first team.
export const resolveLineup = (m: Match) => {
  const players = getPlayers();
  const find = (n: number) => players.find((p) => p.number === n);
  if (m.lineup) {
    const pick = (ns: number[]) => ns.map(find).filter((p): p is Player => Boolean(p));
    return { custom: true, starting: pick(m.lineup.starting), bench: pick(m.lineup.bench) };
  }
  const first = players.filter((p) => (p.team ?? "first") === "first");
  const by = (pos: Player["position"], n: number) =>
    first.filter((p) => p.position === pos).sort((a, b) => a.number - b.number).slice(0, n);
  const starting = [...by("GK", 1), ...by("DEF", 4), ...by("MID", 3), ...by("FWD", 3)];
  return { custom: false, starting, bench: first.filter((p) => !starting.includes(p)) };
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

export const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const outcome = (m: Match): "W" | "D" | "L" | null => {
  if (!m.score) return null;
  return m.score.for > m.score.against ? "W" : m.score.for === m.score.against ? "D" : "L";
};
