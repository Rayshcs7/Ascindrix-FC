"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { readJson, writeJson } from "@/lib/store";
import { scoreFromEvents } from "@/lib/data";
import type { EventType, Match, MatchEvent, MatchStatus } from "@/types";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const optNum = (f: FormData, k: string) => {
  const v = str(f, k);
  return v === "" ? undefined : Number(v);
};

function back(id: string, error?: string): never {
  revalidatePath("/", "layout");
  redirect(`/admin/matches/${id}${error ? `?error=${encodeURIComponent(error)}` : "?saved=1"}`);
}

function load(id: string) {
  const matches = readJson<Match[]>("matches");
  const match = matches.find((m) => m.id === id);
  if (!match) redirect("/admin/matches");
  return { matches, match };
}

// Keep the match score in step with the goals logged.
function syncScore(m: Match) {
  const events = m.events ?? [];
  const hasGoals = events.some((e) => e.type === "goal" || e.type === "own_goal");
  if (hasGoals) m.score = scoreFromEvents(events);
  else if (m.status && m.status !== "scheduled" && !m.score) m.score = { for: 0, against: 0 };
}

const STATUS_EVENTS: Record<Exclude<MatchStatus, "scheduled">, { type: EventType; minute: number }> = {
  first_half: { type: "kickoff", minute: 0 },
  half_time: { type: "halftime", minute: 45 },
  second_half: { type: "secondhalf", minute: 46 },
  full_time: { type: "fulltime", minute: 90 },
};

export async function setMatchStatus(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "matchId");
  const status = str(formData, "status") as MatchStatus;
  const { matches, match } = load(id);

  const statusTypes = new Set<EventType>(["kickoff", "halftime", "secondhalf", "fulltime"]);
  let events = match.events ?? [];

  if (status === "scheduled") {
    // Full reset: back to a fresh, not-started match (the lineup is kept).
    events = [];
    match.status = "scheduled";
    match.score = undefined;
  } else if (status in STATUS_EVENTS) {
    const ev = STATUS_EVENTS[status as Exclude<MatchStatus, "scheduled">];
    events = events.filter((e) => e.type !== ev.type);
    events.push({ id: `e${Date.now().toString(36)}`, type: ev.type, minute: ev.minute });
    match.status = status;
  }

  match.events = events;
  if (status !== "scheduled") syncScore(match);
  writeJson("matches", matches);
  back(id);
}

export async function saveLineup(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "matchId");
  const { matches, match } = load(id);

  const starting: number[] = [];
  const bench: number[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("p_")) continue;
    const n = Number(key.slice(2));
    if (value === "start") starting.push(n);
    if (value === "bench") bench.push(n);
  }
  if (starting.length > 11) back(id, `You picked ${starting.length} starters. A team can only start 11.`);

  match.lineup = { starting, bench };
  writeJson("matches", matches);
  back(id);
}

export async function addEvent(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "matchId");
  const { matches, match } = load(id);

  const type = str(formData, "type") as EventType;
  const side = (str(formData, "side") === "them" ? "them" : "us") as "us" | "them";
  const minute = Number(str(formData, "minute"));
  const player = optNum(formData, "player");
  const player2 = optNum(formData, "player2");
  const name = str(formData, "name");
  const note = str(formData, "note");

  if (!Number.isFinite(minute) || minute < 0 || minute > 130) back(id, "Enter a minute between 0 and 130.");
  if (type === "note" && !note) back(id, "Write the note text.");
  if (type === "sub" && (player === undefined || player2 === undefined)) {
    back(id, "For a substitution, choose the player coming off and the player coming on.");
  }
  if (["goal", "own_goal", "yellow", "red"].includes(type)) {
    if (side === "us" && player === undefined) back(id, "Choose the Ascindrix player.");
  }

  const event: MatchEvent = {
    id: `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    type,
    minute,
    ...(type === "note" ? {} : { side: type === "sub" ? ("us" as const) : side }),
    ...(player !== undefined && (side === "us" || type === "sub") ? { player } : {}),
    ...(player2 !== undefined && (side === "us" || type === "sub") ? { player2 } : {}),
    ...(name && side === "them" && type !== "sub" ? { name } : {}),
    ...(note ? { note } : {}),
  };

  match.events = [...(match.events ?? []), event];
  syncScore(match);
  writeJson("matches", matches);
  back(id);
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "matchId");
  const eventId = str(formData, "eventId");
  const { matches, match } = load(id);

  match.events = (match.events ?? []).filter((e) => e.id !== eventId);
  const hasGoals = match.events.some((e) => e.type === "goal" || e.type === "own_goal");
  if (hasGoals) match.score = scoreFromEvents(match.events);
  else if (match.status) match.score = { for: 0, against: 0 };
  writeJson("matches", matches);
  back(id);
}
