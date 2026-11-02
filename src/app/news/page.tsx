import Link from "next/link";
import { formatLongDate, getNews } from "@/lib/data";

export const metadata = { title: "News | Ascindrix FC" };

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-4xl font-extrabold">News</h1>
      <ul className="mt-6">
        {getNews().map((a) => (
          <li key={a.slug} className="border-b border-ink/10 py-5">
            <p className="text-sm text-slate">{formatLongDate(a.date)}</p>
            <h2 className="font-display text-xl font-bold">
              <Link href={`/news/${a.slug}`} className="hover:underline">{a.title}</Link>
            </h2>
            <p className="mt-1 text-slate">{a.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
