import { DeleteButton, Field, inputClass, Notice, SaveButton } from "@/components/admin";
import { formatLongDate, getNews, type Article } from "@/lib/data";
import { deleteArticle, saveArticle } from "../../actions";

export const metadata = { title: "News | Admin" };

function ArticleForm({ article }: { article?: Article }) {
  return (
    <form action={saveArticle} encType="multipart/form-data" className="grid gap-4">
      <input type="hidden" name="slug" defaultValue={article?.slug ?? ""} />
      <Field label="Title">
        <input name="title" required defaultValue={article?.title} className={inputClass} />
      </Field>
      <Field label="Date">
        <input name="date" type="date" required defaultValue={article?.date} className={inputClass} />
      </Field>
      <Field label="Short summary">
        <input name="summary" defaultValue={article?.summary} className={inputClass} />
      </Field>
      <Field label="Article text (leave a blank line between paragraphs)">
        <textarea name="body" rows={8} defaultValue={article?.body.join("\n\n")} className={inputClass} />
      </Field>
      <div>
        <Field label="Picture (JPG, PNG or WebP, up to 3 MB)">
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} />
        </Field>
        {article?.image && (
          <div className="mt-2 flex items-center gap-3 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.image} alt="" className="h-16 w-28 rounded-lg object-cover" />
            <label className="flex items-center gap-2">
              <input type="checkbox" name="removeImage" /> Remove this picture
            </label>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <SaveButton>{article ? "Save changes" : "Publish article"}</SaveButton>
        {article && <DeleteButton action={deleteArticle} />}
      </div>
    </form>
  );
}

export default async function NewsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const articles = getNews();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">News</h1>
      <div className="mt-4"><Notice saved={saved} error={error} /></div>

      <details className="rounded-xl bg-white p-5 shadow-sm">
        <summary className="cursor-pointer font-bold">Write an article</summary>
        <div className="mt-4"><ArticleForm /></div>
      </details>

      <ul className="mt-6 space-y-3">
        {articles.map((a) => (
          <li key={a.slug}>
            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer">
                <span className="font-bold">{a.title}</span>
                <span className="ml-3 text-sm text-slate">{formatLongDate(a.date)}</span>
              </summary>
              <div className="mt-4"><ArticleForm article={a} /></div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
