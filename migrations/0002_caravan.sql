create table if not exists players (
  user_id text primary key,
  diamonds integer not null default 48,
  xp integer not null default 0,
  play_ms integer not null default 0,
  window_started_at timestamptz not null default now(),
  extra_play_ms integer not null default 0,
  wagered_towards_bypass integer not null default 0,
  bypass_tokens integer not null default 0,
  last_seen_at timestamptz not null default now(),
  last_gen_at timestamptz not null default now(),
  blessing_until timestamptz,
  age_ok boolean not null default false,
  open_hand jsonb
);

create table if not exists prizes (
  id text primary key,
  title text not null,
  description text not null default '',
  kind text not null,
  cost integer not null default 80,
  slot_label_1 text,
  slot_value_1 text,
  slot_label_2 text,
  slot_value_2 text,
  slot_label_3 text,
  slot_value_3 text,
  secret_key text,
  content_cipher text,
  content_iv text,
  content_mime text,
  stock integer not null default 1,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists claims (
  id text primary key,
  user_id text not null,
  prize_id text not null,
  prize_title text not null,
  kind text not null,
  delivered_at timestamptz not null default now()
);

create index if not exists claims_user_id_idx on claims (user_id);
