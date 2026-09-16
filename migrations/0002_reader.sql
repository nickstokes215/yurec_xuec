create table if not exists bookmarks (
  user_id    text not null,
  story_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, story_slug)
);
create index if not exists bookmarks_user_id_idx on bookmarks (user_id);

create table if not exists reading_progress (
  user_id    text not null,
  story_slug text not null,
  percent    integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, story_slug)
);
create index if not exists reading_progress_user_id_idx on reading_progress (user_id);
