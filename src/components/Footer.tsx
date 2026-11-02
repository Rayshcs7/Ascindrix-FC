import Crest from "./Crest";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-8 text-sm">
        <Crest className="h-10 w-auto" />
        <p>© 2026 Ascindrix FC. Home games at Ember Park.</p>
      </div>
    </footer>
  );
}
