-- LPMUCC Complete Database Schema
-- Run this in your Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- Books (physical book codes)
create table books (
  id uuid primary key default uuid_generate_v4(),
  serial_number text unique not null,
  book_number integer not null check (book_number in (1,2,3)),
  qr_token text unique not null,
  access_code text not null,
  access_code_expires_at timestamptz not null,
  access_code_version integer default 1,
  activated boolean default false,
  activated_by_user_id uuid references auth.users(id),
  activated_at timestamptz,
  satellite_redirect boolean default false,
  satellite_node_slug text,
  created_at timestamptz default now(),
  batch_id text
);

-- Users (extends Supabase auth)
create table users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  username text unique not null,
  display_name text,
  book_1_serial text,
  book_2_serial text,
  book_3_serial text,
  book_1_activated_at timestamptz,
  book_2_activated_at timestamptz,
  book_3_activated_at timestamptz,
  keys_verified integer[] default '{}',
  keys_submitted_at jsonb default '{}',
  book_1_purchased_at timestamptz,
  book_2_purchased_at timestamptz,
  book_3_purchased_at timestamptz,
  stripe_customer_id text,
  account_created_at timestamptz default now(),
  dashboard_unlocked boolean default false,
  tier text default 'piece',
  consultation_scheduled boolean default false,
  gift_card_sent boolean default false,
  registry_entry_id uuid,
  failed_activation_attempts integer default 0
);

-- Vault submissions (key submissions)
create table vault_submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  key_number integer not null check (key_number between 1 and 33),
  key_word text not null,
  proof_artifact_url text not null,
  submitted_at timestamptz not null default now(),
  verified boolean default false,
  verified_at timestamptz,
  webmaster_notes text,
  rejection_riddle text,
  review_status text default 'pending' check (review_status in ('pending','verified','rejected'))
);

-- Prevent submitted_at from being updated (immutable timestamp)
create or replace function prevent_submitted_at_update()
returns trigger as $$
begin
  if old.submitted_at is not null and new.submitted_at != old.submitted_at then
    raise exception 'submitted_at is immutable';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger vault_submissions_immutable_timestamp
  before update on vault_submissions
  for each row execute function prevent_submitted_at_update();

-- Complete submissions (vault hunt entries)
create table complete_submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  submission_year integer not null,
  ciphered_phrase text not null,
  bankers_creed_image_url text not null,
  dynasty_trust_page_url text not null,
  irs_ein_letter_url text not null,
  certified_mail_tracking_number text not null,
  usps_verification_status text default 'pending',
  personal_statement text not null,
  submitted_at timestamptz not null default now(),
  account_age_days integer not null,
  review_status text default 'pending',
  reviewed_by_admin_id uuid,
  challenge_answer text,
  challenge_verified boolean default false,
  prize_tier text,
  prize_paid_at timestamptz,
  internal_notes text
);

-- Book purchases
create table book_purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  book_number integer not null,
  stripe_payment_id text unique not null,
  purchased_at timestamptz default now(),
  price_paid integer not null,
  download_url text,
  download_url_expires_at timestamptz,
  download_count integer default 0
);

-- Satellite nodes
create table satellite_nodes (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  content_html text not null,
  unlock_requirement_keys integer default 0,
  unlock_requirement_book integer default 0,
  active boolean default true,
  load_delay_seconds integer default 0,
  created_at timestamptz default now()
);

-- Webmaster messages
create table webmaster_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  trigger_type text not null,
  message_subject text not null,
  message_body text not null,
  sent_at timestamptz default now(),
  sent_by_admin_id uuid,
  read_by_user boolean default false
);

-- Annual ciphers
create table annual_ciphers (
  id uuid primary key default uuid_generate_v4(),
  year integer unique not null,
  cipher_algorithm text not null,
  cipher_display_instructions text not null,
  proof_format_requirements jsonb not null default '{}',
  challenge_question_text text,
  active boolean default false,
  activates_at timestamptz not null
);

-- Registry
create table registry (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) unique,
  public_name text not null,
  completion_year integer not null,
  prize_tier text not null,
  public_statement text not null,
  prior_year_challenge_question text,
  approved boolean default false,
  approved_at timestamptz,
  show_challenge_question boolean default false
);

-- Platform stats
create table platform_stats (
  id uuid primary key default uuid_generate_v4(),
  stat_key text unique not null,
  stat_value integer default 0,
  last_updated timestamptz default now()
);

insert into platform_stats (stat_key, stat_value) values
  ('keys_found_globally', 0),
  ('days_since_launch', 1),
  ('structures_submitted_current_year', 0),
  ('hunters_active', 0);

-- Admin log
create table admin_log (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid,
  action text not null,
  target_user_id uuid,
  target_resource_id uuid,
  notes text,
  timestamp timestamptz default now()
);

-- Book codes export
create table book_codes_export (
  id uuid primary key default uuid_generate_v4(),
  batch_id text not null,
  book_number integer not null,
  serial_number text not null,
  access_code text not null,
  qr_token text not null,
  qr_url text not null,
  expires_at timestamptz not null,
  generated_at timestamptz default now(),
  exported_at timestamptz
);

-- Row Level Security
alter table users enable row level security;
alter table vault_submissions enable row level security;
alter table complete_submissions enable row level security;
alter table book_purchases enable row level security;
alter table webmaster_messages enable row level security;
alter table registry enable row level security;
alter table platform_stats enable row level security;

-- Users can only see their own data
create policy "users_own_data" on users for all using (auth.uid() = id);
create policy "submissions_own_data" on vault_submissions for all using (auth.uid() = user_id);
create policy "complete_own_data" on complete_submissions for all using (auth.uid() = user_id);
create policy "purchases_own_data" on book_purchases for all using (auth.uid() = user_id);
create policy "messages_own_data" on webmaster_messages for select using (auth.uid() = user_id);
-- Registry is public read
create policy "registry_public_read" on registry for select using (approved = true);
-- Platform stats is public read
create policy "stats_public_read" on platform_stats for select using (true);

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into users (id, email, username, account_created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
