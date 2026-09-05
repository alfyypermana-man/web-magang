-- =====================================================================
-- MAGANGKU — SUPABASE DATABASE SCHEMA
-- =====================================================================
-- Jalankan file ini di Supabase Dashboard → SQL Editor.
-- Aman dijalankan berulang kali (menggunakan IF NOT EXISTS / OR REPLACE).
-- =====================================================================

create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. PROFILES  (terhubung ke auth.users)
-- =====================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null check (role in ('admin', 'student', 'company')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 2. STUDENTS
-- =====================================================================
create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  whatsapp text,
  school_name text,
  major text,
  class_name text,
  location text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 3. COMPANIES
-- =====================================================================
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  company_name text not null,
  logo_url text,
  phone text,
  industry text,
  address text,
  website text,
  description text,
  company_size text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 4. JOB CATEGORIES & SKILLS
-- =====================================================================
create table if not exists job_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  icon text
);

create table if not exists skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

-- =====================================================================
-- 5. JOBS
-- =====================================================================
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  category_id uuid references job_categories(id) on delete set null,
  title text not null,
  description text,
  responsibilities text,
  requirements text,
  benefits text,
  location text,
  work_type text check (work_type in ('Remote', 'On-site', 'Hybrid')),
  duration text,
  start_date date,
  end_date date,
  deadline date,
  positions_available integer default 1,
  major text,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_company on jobs(company_id);
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_jobs_category on jobs(category_id);

create table if not exists job_skills (
  job_id uuid not null references jobs(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  primary key (job_id, skill_id)
);

create table if not exists student_skills (
  student_id uuid not null references students(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  primary key (student_id, skill_id)
);

-- =====================================================================
-- 6. SAVED JOBS
-- =====================================================================
create table if not exists saved_jobs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, job_id)
);

-- =====================================================================
-- 7. RESUMES (CV)
-- =====================================================================
create table if not exists resumes (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  title text not null default 'CV Saya',
  template text not null default 'minimal',
  content jsonb not null default '{}'::jsonb,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_resumes_student on resumes(student_id);

-- =====================================================================
-- 8. APPLICATIONS
-- =====================================================================
create table if not exists applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  resume_id uuid references resumes(id) on delete set null,
  cover_letter text,
  whatsapp text,
  note text,
  status text not null default 'applied'
    check (status in ('applied', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, student_id)
);

create index if not exists idx_applications_job on applications(job_id);
create index if not exists idx_applications_student on applications(student_id);
create index if not exists idx_applications_status on applications(status);

-- =====================================================================
-- 9. INTERVIEWS
-- =====================================================================
create table if not exists interviews (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  scheduled_at timestamptz not null,
  type text not null default 'online' check (type in ('online', 'offline')),
  location text,
  meeting_link text,
  notes text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_interviews_application on interviews(application_id);

-- =====================================================================
-- 10. MESSAGES (student <-> company)
-- =====================================================================
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  sender_role text not null check (sender_role in ('student', 'company')),
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_pair on messages(student_id, company_id, created_at);

-- =====================================================================
-- 11. NOTIFICATIONS
-- =====================================================================
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  type text default 'info',
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, is_read);

-- =====================================================================
-- 12. PORTFOLIOS
-- =====================================================================
create table if not exists portfolios (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null unique references students(id) on delete cascade,
  username text not null unique,
  about text,
  skills_text text,
  experience_text text,
  education_text text,
  certificates_text text,
  contact_email text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_projects (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  name text not null,
  description text,
  technologies text,
  screenshot_url text,
  github_url text,
  demo_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolio_projects_student on portfolio_projects(student_id);

-- =====================================================================
-- 13. EXPERIENCE / EDUCATION / CERTIFICATES
-- =====================================================================
create table if not exists experiences (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  title text not null,
  organization text,
  start_date date,
  end_date date,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists education (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  institution text not null,
  degree text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists certificates (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  name text not null,
  issuer text,
  issued_date date,
  file_url text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 14. REPORTS
-- =====================================================================
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('job', 'company', 'student', 'content')),
  target_id uuid,
  reason text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'rejected')),
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 15. ACTIVITY LOGS
-- =====================================================================
create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_created on activity_logs(created_at desc);

-- =====================================================================
-- UPDATED_AT TRIGGER HELPER
-- =====================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array['profiles','students','companies','jobs','resumes','applications','portfolios']
  loop
    execute format('drop trigger if exists trg_set_updated_at on %I;', t);
    execute format('create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- =====================================================================
-- SEED: JOB CATEGORIES & SKILLS (aman dijalankan ulang)
-- =====================================================================
insert into job_categories (name, icon) values
  ('Teknologi & IT', 'code'),
  ('Marketing & Media', 'megaphone'),
  ('Keuangan & Akuntansi', 'line-chart'),
  ('Desain & Kreatif', 'palette'),
  ('Teknik & Manufaktur', 'wrench'),
  ('Administrasi & Umum', 'sparkles')
on conflict (name) do nothing;

insert into skills (name) values
  ('React'), ('JavaScript'), ('TypeScript'), ('SQL'), ('Python'), ('Java'),
  ('UI/UX Design'), ('Figma'), ('Content Writing'), ('Digital Marketing'),
  ('Data Analysis'), ('Microsoft Excel'), ('Public Speaking'), ('Photography'),
  ('Video Editing'), ('Networking'), ('Customer Service'), ('Accounting')
on conflict (name) do nothing;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table profiles enable row level security;
alter table students enable row level security;
alter table companies enable row level security;
alter table job_categories enable row level security;
alter table skills enable row level security;
alter table jobs enable row level security;
alter table job_skills enable row level security;
alter table student_skills enable row level security;
alter table saved_jobs enable row level security;
alter table resumes enable row level security;
alter table applications enable row level security;
alter table interviews enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table portfolios enable row level security;
alter table portfolio_projects enable row level security;
alter table experiences enable row level security;
alter table education enable row level security;
alter table certificates enable row level security;
alter table reports enable row level security;
alter table activity_logs enable row level security;

-- ---------------------------------------------------------------------
-- Helper: fungsi-fungsi bantu (mengurangi duplikasi subquery di policy)
-- ---------------------------------------------------------------------
create or replace function current_role_name()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer;

create or replace function my_student_id()
returns uuid as $$
  select id from students where user_id = auth.uid();
$$ language sql stable security definer;

create or replace function my_company_id()
returns uuid as $$
  select id from companies where user_id = auth.uid();
$$ language sql stable security definer;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin() or true);
  -- Catatan: profile bersifat semi-publik (nama & foto ditampilkan di job/portfolio publik),
  -- namun data sensitif TIDAK disimpan di tabel ini.

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles
  for update using (id = auth.uid() or is_admin());

drop policy if exists "profiles_delete_admin" on profiles;
create policy "profiles_delete_admin" on profiles
  for delete using (is_admin());

-- ---------------------------------------------------------------------
-- STUDENTS
-- ---------------------------------------------------------------------
drop policy if exists "students_select_own_company_admin" on students;
create policy "students_select_own_company_admin" on students
  for select using (
    user_id = auth.uid()
    or is_admin()
    or exists ( -- perusahaan boleh melihat data siswa yang melamar ke lowongannya
      select 1 from applications a
      join jobs j on j.id = a.job_id
      where a.student_id = students.id and j.company_id = my_company_id()
    )
  );

drop policy if exists "students_insert_own" on students;
create policy "students_insert_own" on students
  for insert with check (user_id = auth.uid());

drop policy if exists "students_update_own_or_admin" on students;
create policy "students_update_own_or_admin" on students
  for update using (user_id = auth.uid() or is_admin());

drop policy if exists "students_delete_admin" on students;
create policy "students_delete_admin" on students
  for delete using (is_admin());

-- ---------------------------------------------------------------------
-- COMPANIES
-- ---------------------------------------------------------------------
drop policy if exists "companies_select_all" on companies;
create policy "companies_select_all" on companies
  for select using (true); -- direktori perusahaan publik; frontend memfilter status=verified

drop policy if exists "companies_insert_own" on companies;
create policy "companies_insert_own" on companies
  for insert with check (user_id = auth.uid());

drop policy if exists "companies_update_own_or_admin" on companies;
create policy "companies_update_own_or_admin" on companies
  for update using (
    (user_id = auth.uid() and status <> 'suspended')
    or is_admin()
  );

drop policy if exists "companies_delete_admin" on companies;
create policy "companies_delete_admin" on companies
  for delete using (is_admin());

-- ---------------------------------------------------------------------
-- JOB CATEGORIES & SKILLS (referensi publik, hanya admin yang mengubah)
-- ---------------------------------------------------------------------
drop policy if exists "job_categories_select_all" on job_categories;
create policy "job_categories_select_all" on job_categories for select using (true);
drop policy if exists "job_categories_write_admin" on job_categories;
create policy "job_categories_write_admin" on job_categories for all using (is_admin()) with check (is_admin());

drop policy if exists "skills_select_all" on skills;
create policy "skills_select_all" on skills for select using (true);
drop policy if exists "skills_write_admin" on skills;
create policy "skills_write_admin" on skills for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- JOBS
-- ---------------------------------------------------------------------
drop policy if exists "jobs_select_public_or_owner" on jobs;
create policy "jobs_select_public_or_owner" on jobs
  for select using (
    status = 'active'
    or company_id = my_company_id()
    or is_admin()
  );

drop policy if exists "jobs_insert_own_company" on jobs;
create policy "jobs_insert_own_company" on jobs
  for insert with check (
    company_id = my_company_id()
    and exists (select 1 from companies c where c.id = company_id and c.status = 'verified')
  );

drop policy if exists "jobs_update_own_or_admin" on jobs;
create policy "jobs_update_own_or_admin" on jobs
  for update using (company_id = my_company_id() or is_admin());

drop policy if exists "jobs_delete_own_or_admin" on jobs;
create policy "jobs_delete_own_or_admin" on jobs
  for delete using (company_id = my_company_id() or is_admin());

-- ---------------------------------------------------------------------
-- JOB_SKILLS
-- ---------------------------------------------------------------------
drop policy if exists "job_skills_select_all" on job_skills;
create policy "job_skills_select_all" on job_skills for select using (true);

drop policy if exists "job_skills_write_owner_or_admin" on job_skills;
create policy "job_skills_write_owner_or_admin" on job_skills
  for all using (
    is_admin() or exists (select 1 from jobs j where j.id = job_id and j.company_id = my_company_id())
  )
  with check (
    is_admin() or exists (select 1 from jobs j where j.id = job_id and j.company_id = my_company_id())
  );

-- ---------------------------------------------------------------------
-- STUDENT_SKILLS
-- ---------------------------------------------------------------------
drop policy if exists "student_skills_select_related" on student_skills;
create policy "student_skills_select_related" on student_skills
  for select using (
    student_id = my_student_id()
    or is_admin()
    or exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.student_id = student_skills.student_id and j.company_id = my_company_id()
    )
  );

drop policy if exists "student_skills_write_own" on student_skills;
create policy "student_skills_write_own" on student_skills
  for all using (student_id = my_student_id() or is_admin())
  with check (student_id = my_student_id() or is_admin());

-- ---------------------------------------------------------------------
-- SAVED_JOBS (hanya milik siswa sendiri)
-- ---------------------------------------------------------------------
drop policy if exists "saved_jobs_all_own" on saved_jobs;
create policy "saved_jobs_all_own" on saved_jobs
  for all using (student_id = my_student_id() or is_admin())
  with check (student_id = my_student_id());

-- ---------------------------------------------------------------------
-- RESUMES (milik siswa sendiri; perusahaan boleh lihat via applications)
-- ---------------------------------------------------------------------
drop policy if exists "resumes_select_own_or_related" on resumes;
create policy "resumes_select_own_or_related" on resumes
  for select using (
    student_id = my_student_id()
    or is_admin()
    or exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.resume_id = resumes.id and j.company_id = my_company_id()
    )
  );

drop policy if exists "resumes_write_own" on resumes;
create policy "resumes_write_own" on resumes
  for all using (student_id = my_student_id() or is_admin())
  with check (student_id = my_student_id());

-- ---------------------------------------------------------------------
-- APPLICATIONS
-- ---------------------------------------------------------------------
drop policy if exists "applications_select_related" on applications;
create policy "applications_select_related" on applications
  for select using (
    student_id = my_student_id()
    or is_admin()
    or exists (select 1 from jobs j where j.id = job_id and j.company_id = my_company_id())
  );

drop policy if exists "applications_insert_own_student" on applications;
create policy "applications_insert_own_student" on applications
  for insert with check (student_id = my_student_id());

drop policy if exists "applications_update_related" on applications;
create policy "applications_update_related" on applications
  for update using (
    is_admin()
    or exists (select 1 from jobs j where j.id = job_id and j.company_id = my_company_id())
    or student_id = my_student_id() -- siswa boleh update data lamarannya sendiri (misal batal)
  );

drop policy if exists "applications_delete_admin" on applications;
create policy "applications_delete_admin" on applications
  for delete using (is_admin() or student_id = my_student_id());

-- ---------------------------------------------------------------------
-- INTERVIEWS
-- ---------------------------------------------------------------------
drop policy if exists "interviews_select_related" on interviews;
create policy "interviews_select_related" on interviews
  for select using (
    is_admin()
    or exists (
      select 1 from applications a where a.id = application_id and a.student_id = my_student_id()
    )
    or exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.id = application_id and j.company_id = my_company_id()
    )
  );

drop policy if exists "interviews_write_company_or_admin" on interviews;
create policy "interviews_write_company_or_admin" on interviews
  for all using (
    is_admin()
    or exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.id = application_id and j.company_id = my_company_id()
    )
  )
  with check (
    is_admin()
    or exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.id = application_id and j.company_id = my_company_id()
    )
  );

-- ---------------------------------------------------------------------
-- MESSAGES
-- ---------------------------------------------------------------------
drop policy if exists "messages_select_participant" on messages;
create policy "messages_select_participant" on messages
  for select using (
    student_id = my_student_id() or company_id = my_company_id() or is_admin()
  );

drop policy if exists "messages_insert_participant" on messages;
create policy "messages_insert_participant" on messages
  for insert with check (
    (sender_role = 'student' and student_id = my_student_id() and sender_id = auth.uid())
    or (sender_role = 'company' and company_id = my_company_id() and sender_id = auth.uid())
  );

drop policy if exists "messages_update_participant" on messages;
create policy "messages_update_participant" on messages
  for update using (
    student_id = my_student_id() or company_id = my_company_id() or is_admin()
  );

-- ---------------------------------------------------------------------
-- NOTIFICATIONS (hanya pemilik yang boleh melihat/menandai baca)
-- ---------------------------------------------------------------------
drop policy if exists "notifications_select_own" on notifications;
create policy "notifications_select_own" on notifications
  for select using (user_id = auth.uid() or is_admin());

drop policy if exists "notifications_insert_related" on notifications;
create policy "notifications_insert_related" on notifications
  for insert with check (
    is_admin()
    or exists (select 1 from companies c where c.user_id = notifications.user_id) -- diperlukan agar company bisa dinotif oleh sistem
    or true -- notifikasi dibuat oleh pihak lain (mis. company -> student). Dibatasi lebih lanjut di aplikasi.
  );

drop policy if exists "notifications_update_own" on notifications;
create policy "notifications_update_own" on notifications
  for update using (user_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------------
-- PORTFOLIOS & PROJECTS
-- ---------------------------------------------------------------------
drop policy if exists "portfolios_select_public_or_own" on portfolios;
create policy "portfolios_select_public_or_own" on portfolios
  for select using (is_public = true or student_id = my_student_id() or is_admin());

drop policy if exists "portfolios_write_own" on portfolios;
create policy "portfolios_write_own" on portfolios
  for all using (student_id = my_student_id() or is_admin())
  with check (student_id = my_student_id());

drop policy if exists "portfolio_projects_select_public_or_own" on portfolio_projects;
create policy "portfolio_projects_select_public_or_own" on portfolio_projects
  for select using (
    student_id = my_student_id()
    or is_admin()
    or exists (select 1 from portfolios p where p.student_id = portfolio_projects.student_id and p.is_public = true)
  );

drop policy if exists "portfolio_projects_write_own" on portfolio_projects;
create policy "portfolio_projects_write_own" on portfolio_projects
  for all using (student_id = my_student_id() or is_admin())
  with check (student_id = my_student_id());

-- ---------------------------------------------------------------------
-- EXPERIENCES / EDUCATION / CERTIFICATES (milik siswa sendiri)
-- ---------------------------------------------------------------------
drop policy if exists "experiences_all_own" on experiences;
create policy "experiences_all_own" on experiences
  for all using (student_id = my_student_id() or is_admin())
  with check (student_id = my_student_id());

drop policy if exists "education_all_own" on education;
create policy "education_all_own" on education
  for all using (student_id = my_student_id() or is_admin())
  with check (student_id = my_student_id());

drop policy if exists "certificates_all_own" on certificates;
create policy "certificates_all_own" on certificates
  for all using (student_id = my_student_id() or is_admin())
  with check (student_id = my_student_id());

-- ---------------------------------------------------------------------
-- REPORTS
-- ---------------------------------------------------------------------
drop policy if exists "reports_select_own_or_admin" on reports;
create policy "reports_select_own_or_admin" on reports
  for select using (reporter_id = auth.uid() or is_admin());

drop policy if exists "reports_insert_own" on reports;
create policy "reports_insert_own" on reports
  for insert with check (reporter_id = auth.uid());

drop policy if exists "reports_update_admin" on reports;
create policy "reports_update_admin" on reports
  for update using (is_admin());

-- ---------------------------------------------------------------------
-- ACTIVITY LOGS (tulis oleh siapa saja yang login, baca hanya admin)
-- ---------------------------------------------------------------------
drop policy if exists "activity_logs_select_admin" on activity_logs;
create policy "activity_logs_select_admin" on activity_logs
  for select using (is_admin());

drop policy if exists "activity_logs_insert_authenticated" on activity_logs;
create policy "activity_logs_insert_authenticated" on activity_logs
  for insert with check (auth.uid() is not null);

-- =====================================================================
-- STORAGE BUCKETS
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp']),
  ('company-logos', 'company-logos', true, 2097152, array['image/png','image/jpeg','image/webp']),
  ('portfolio-images', 'portfolio-images', true, 2097152, array['image/png','image/jpeg','image/webp']),
  ('resumes', 'resumes', true, 5242880, array['application/pdf']),
  ('certificates', 'certificates', true, 5242880, array['application/pdf','image/png','image/jpeg'])
on conflict (id) do nothing;

-- Storage policies: public read, authenticated users can only write to a
-- folder prefixed with their own auth.uid(), e.g. avatars/{user_id}/file.png
drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects
  for select using (bucket_id in ('avatars','company-logos','portfolio-images','resumes','certificates'));

drop policy if exists "storage_owner_insert" on storage.objects;
create policy "storage_owner_insert" on storage.objects
  for insert with check (
    bucket_id in ('avatars','company-logos','portfolio-images','resumes','certificates')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_owner_update" on storage.objects;
create policy "storage_owner_update" on storage.objects
  for update using (
    bucket_id in ('avatars','company-logos','portfolio-images','resumes','certificates')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_owner_delete" on storage.objects;
create policy "storage_owner_delete" on storage.objects
  for delete using (
    bucket_id in ('avatars','company-logos','portfolio-images','resumes','certificates')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- SELESAI
-- =====================================================================
-- Langkah selanjutnya:
-- 1. Buat akun admin lewat Authentication > Users, lalu jalankan:
--    insert into profiles (id, full_name, role) values ('<user-uuid>', 'Admin MagangKu', 'admin');
-- 2. (Opsional) jalankan supabase/seed.sql untuk data contoh development.
-- =====================================================================
