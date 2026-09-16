import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";

export const listBookmarks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ story_slug: string; created_at: string }>`
      select story_slug, created_at
      from bookmarks
      where user_id = ${context.userId}
      order by created_at desc
    `;
  });

export const toggleBookmark = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((slug: string) => slug.trim())
  .handler(async ({ context, data: slug }) => {
    if (!slug) return { saved: false };
    const sql = await getSql();
    const existing = await sql<{ story_slug: string }>`
      select story_slug from bookmarks
      where user_id = ${context.userId} and story_slug = ${slug}
    `;
    if (existing.length) {
      await sql`
        delete from bookmarks
        where user_id = ${context.userId} and story_slug = ${slug}
      `;
      return { saved: false };
    }
    await sql`
      insert into bookmarks (user_id, story_slug)
      values (${context.userId}, ${slug})
    `;
    return { saved: true };
  });

const progressSchema = z.object({
  slug: z.string().min(1),
  percent: z.number().min(0).max(100),
});

export const saveProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => progressSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into reading_progress (user_id, story_slug, percent, updated_at)
      values (${context.userId}, ${data.slug}, ${Math.round(data.percent)}, now())
      on conflict (user_id, story_slug)
      do update set percent = excluded.percent, updated_at = now()
    `;
  });

export const listProgress = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ story_slug: string; percent: number; updated_at: string }>`
      select story_slug, percent, updated_at
      from reading_progress
      where user_id = ${context.userId}
      order by updated_at desc
    `;
  });
