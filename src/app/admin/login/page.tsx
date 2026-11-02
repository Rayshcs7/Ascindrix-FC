import { redirect } from "next/navigation";
import Crest from "@/components/Crest";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { login } from "../actions";

export const metadata = { title: "Admin login | Ascindrix FC" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = adminConfigured();

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <Crest className="mb-4 h-16 w-auto" />
      <h1 className="font-display text-3xl font-extrabold">Admin login</h1>
      {!configured && (
        <p role="alert" className="mt-4 rounded-lg bg-loss/10 px-4 py-3 text-loss">
          No password is set. Add <code>ADMIN_PASSWORD=your-password</code> to <code>.env.local</code> and restart the server.
        </p>
      )}
      {error && configured && <p role="alert" className="mt-4 text-loss">Wrong password.</p>}
      <form action={login} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">
          <span className="mb-1 block">Password</span>
          <input name="password" type="password" required autoFocus className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-base" />
        </label>
        <button type="submit" className="w-full rounded-full bg-ink px-5 py-3 font-bold text-white hover:bg-ink-soft">
          Log in
        </button>
      </form>
    </div>
  );
}
