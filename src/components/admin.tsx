import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-base focus:border-ink";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export function SaveButton({ children = "Save" }: { children?: ReactNode }) {
  return (
    <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-white hover:bg-ink-soft">
      {children}
    </button>
  );
}

export function DeleteButton({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <button
      type="submit"
      formAction={action}
      formNoValidate
      className="rounded-full border border-loss px-5 py-2 text-sm font-bold text-loss hover:bg-loss hover:text-white"
    >
      Delete
    </button>
  );
}

export function Notice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p role="alert" className="mb-4 rounded-lg bg-loss/10 px-4 py-3 text-loss">{error}</p>;
  if (saved) return <p role="status" className="mb-4 rounded-lg bg-win/10 px-4 py-3 text-win">Saved. The public site is updated.</p>;
  return null;
}
