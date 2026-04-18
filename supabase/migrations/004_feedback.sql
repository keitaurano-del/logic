-- SCRUM-87: In-App フィードバック収集テーブル
create table if not exists feedback (
  id          bigserial primary key,
  category    text not null default 'その他',
  message     text not null,
  locale      text not null default 'ja',
  created_at  timestamptz not null default now()
);

-- RLS: 書き込みは誰でも可、読み取りはサービスロールのみ
alter table feedback enable row level security;

create policy "Anyone can insert feedback"
  on feedback for insert
  with check (true);

create policy "Service role can read feedback"
  on feedback for select
  using (auth.role() = 'service_role');
