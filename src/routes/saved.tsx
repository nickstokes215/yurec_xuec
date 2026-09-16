import { createFileRoute } from "@tanstack/react-router";
import { StoryCard } from "@/components/story-card";
import { getStory } from "@/data/catalog";
import { useBookmarks } from "@/lib/use-library";

export const Route = createFileRoute("/saved")({ component: SavedPage });

function SavedPage() {
  const { slugs, ready } = useBookmarks();
  const list = slugs.map((s) => getStory(s)).filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <main className="px-4 pt-4 pb-8">
      <h2 className="font-sans text-xl font-semibold">Закладки</h2>
      <p className="mt-1 text-sm text-muted">Хранятся на этом устройстве.</p>

      <div className="board mt-5">
        {!ready ? (
          <div className="h-28 animate-pulse rounded-xl bg-surface" />
        ) : list.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted">
            Пусто. Откройте любой рассказ и нажмите закладку.
          </p>
        ) : (
          list.map((story) => <StoryCard key={story.slug} story={story} />)
        )}
      </div>
    </main>
  );
}
