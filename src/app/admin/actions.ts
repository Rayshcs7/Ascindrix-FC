"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/auth";
import { readJson, writeJson } from "@/lib/store";
import type { Match, Player, Competition, Position, StandingEntry } from "@/types";
import { isUpload, removeUpload, saveUpload } from "@/lib/uploads";
import type { Article } from "@/lib/data";
import { slugify } from "@/lib/data";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => Number(str(f, k) || 0);

function back(path: string, error?: string): never {
  revalidatePath("/", "layout");
  redirect(error ? `${path}?error=${encodeURIComponent(error)}` : `${path}?saved=1`);
}

// ---------- session ----------
export async function login(formData: FormData) {
  if (!passwordMatches(str(formData, "password"))) {
    redirect("/admin/login?error=1");
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------- matches ----------
export async function saveMatch(formData: FormData) {
  await requireAdmin();
  const matches = readJson<Match[]>("matches");
  const id = str(formData, "id");
  const opponent = str(formData, "opponent");
  const date = str(formData, "date");
  if (!opponent || !date) back("/admin/matches", "Opponent and date are required.");

  const scoreFor = str(formData, "scoreFor");
  const scoreAgainst = str(formData, "scoreAgainst");
  const hasScore = scoreFor !== "" && scoreAgainst !== "";

  const i = matches.findIndex((m) => m.id === id);
  const existing = i >= 0 ? matches[i] : undefined;

  // Keep the lineup, events and status set in the match centre.
  const match: Match = {
    ...existing,
    id: id || `m${Date.now()}`,
    date: `${date.slice(0, 16)}:00Z`,
    opponent,
    home: str(formData, "home") === "home",
    competition: (str(formData, "competition") || "League") as Competition,
    venue: str(formData, "venue") || (str(formData, "home") === "home" ? "Ember Park" : "TBC"),
    score: hasScore ? { for: Number(scoreFor), against: Number(scoreAgainst) } : undefined,
  };
  // A score typed in by hand on a not-started match means the result is final.
  if (hasScore && match.status === "scheduled") match.status = "full_time";
  if (!hasScore && !match.events?.length && match.status === "full_time") match.status = undefined;

  if (i >= 0) matches[i] = match;
  else matches.push(match);
  writeJson("matches", matches);
  back("/admin/matches");
}

export async function deleteMatch(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  writeJson("matches", readJson<Match[]>("matches").filter((m) => m.id !== id));
  back("/admin/matches");
}

// Saves a newly chosen image, or keeps / removes the existing one.
async function resolveImage(
  formData: FormData,
  field: string,
  removeField: string,
  existing: string | undefined,
  path: string,
): Promise<string | undefined> {
  const file = formData.get(field);
  if (isUpload(file)) {
    let url: string;
    try {
      url = await saveUpload(file);
    } catch (e) {
      back(path, e instanceof Error ? e.message : "Upload failed.");
    }
    removeUpload(existing);
    return url;
  }
  if (formData.get(removeField)) {
    removeUpload(existing);
    return undefined;
  }
  return existing;
}

// ---------- players ----------
export async function savePlayer(formData: FormData) {
  await requireAdmin();
  const players = readJson<Player[]>("players");
  const original = str(formData, "original");
  const name = str(formData, "name");
  const number = num(formData, "number");
  if (!name || !number) back("/admin/players", "Name and shirt number are required.");

  const clash = players.some((p) => p.number === number && String(p.number) !== original);
  if (clash) back("/admin/players", `Shirt number ${number} is already taken.`);

  const i = players.findIndex((p) => String(p.number) === original);
  const photo = await resolveImage(formData, "photo", "removePhoto", players[i]?.photo, "/admin/players");

  const player: Player = {
    number,
    name,
    position: (str(formData, "position") || "MID") as Position,
    age: num(formData, "age"),
    goals: num(formData, "goals"),
    assists: num(formData, "assists"),
    team: str(formData, "team") === "reserves" ? "reserves" : "first",
    ...(photo ? { photo } : {}),
  };

  if (i >= 0) players[i] = player;
  else players.push(player);
  writeJson("players", players);
  back("/admin/players");
}

export async function deletePlayer(formData: FormData) {
  await requireAdmin();
  const original = str(formData, "original");
  const players = readJson<Player[]>("players");
  removeUpload(players.find((p) => String(p.number) === original)?.photo);
  writeJson("players", players.filter((p) => String(p.number) !== original));
  back("/admin/players");
}

// ---------- news ----------
export async function saveArticle(formData: FormData) {
  await requireAdmin();
  const articles = readJson<Article[]>("news");
  const original = str(formData, "slug");
  const title = str(formData, "title");
  const date = str(formData, "date");
  if (!title || !date) back("/admin/news", "Title and date are required.");

  let slug = original;
  if (!slug) {
    const base = slugify(title) || "article";
    slug = base;
    let n = 2;
    while (articles.some((a) => a.slug === slug)) slug = `${base}-${n++}`;
  }

  const i = articles.findIndex((a) => a.slug === slug);
  const image = await resolveImage(formData, "image", "removeImage", articles[i]?.image, "/admin/news");

  const article: Article = {
    slug,
    title,
    date,
    summary: str(formData, "summary"),
    body: str(formData, "body").split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean),
    ...(image ? { image } : {}),
  };

  if (i >= 0) articles[i] = article;
  else articles.push(article);
  writeJson("news", articles);
  back("/admin/news");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const slug = str(formData, "slug");
  const articles = readJson<Article[]>("news");
  removeUpload(articles.find((a) => a.slug === slug)?.image);
  writeJson("news", articles.filter((a) => a.slug !== slug));
  back("/admin/news");
}

// ---------- standings ----------
export async function saveStanding(formData: FormData) {
  await requireAdmin();
  const rows = readJson<StandingEntry[]>("standings");
  const original = str(formData, "original");
  const team = str(formData, "team");
  if (!team) back("/admin/standings", "Team name is required.");

  const clash = rows.some((r) => r.team.toLowerCase() === team.toLowerCase() && r.team !== original);
  if (clash) back("/admin/standings", `${team} is already in the table.`);

  const row: StandingEntry = {
    team,
    won: num(formData, "won"),
    drawn: num(formData, "drawn"),
    lost: num(formData, "lost"),
    gf: num(formData, "gf"),
    ga: num(formData, "ga"),
  };

  const i = rows.findIndex((r) => r.team === original);
  if (i >= 0) rows[i] = row;
  else rows.push(row);
  writeJson("standings", rows);
  back("/admin/standings");
}

export async function deleteStanding(formData: FormData) {
  await requireAdmin();
  const original = str(formData, "original");
  writeJson("standings", readJson<StandingEntry[]>("standings").filter((r) => r.team !== original));
  back("/admin/standings");
}
