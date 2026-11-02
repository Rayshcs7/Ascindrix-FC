import Link from "next/link";
import { notFound } from "next/navigation";
import { formatLongDate, getArticle, getNews } from "@/lib/data";

export function generateStaticParams() {
  return getNews().map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/news" className="text-sm text-slate hover:underline">Back to news</Link>
      {article.image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.image} alt="" className="mt-6 aspect-video w-full rounded-xl object-cover" />
        </>
      )}
      <p className="mt-6 text-sm text-slate">{formatLongDate(article.date)}</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold leading-tight">{article.title}</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed">
        {article.body.map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </article>
  );
}
