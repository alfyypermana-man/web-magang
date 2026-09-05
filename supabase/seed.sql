-- =====================================================================
-- MAGANGKU — SEED DATA (OPSIONAL, UNTUK DEVELOPMENT)
-- =====================================================================
-- Jalankan file ini SETELAH schema.sql.
--
-- Supabase Auth tidak bisa dibuat murni lewat SQL (password di-hash oleh
-- GoTrue), jadi alur seeding yang disarankan:
--
-- 1. Buat beberapa akun contoh via halaman /register/student dan
--    /register/company di aplikasi (gunakan email fiktif, mis.
--    siswa1@example.com, perusahaan1@example.com).
-- 2. Login ke Supabase Dashboard > Authentication > Users, verifikasi
--    email akun-akun tersebut secara manual jika email confirmation aktif.
-- 3. Jalankan blok SQL di bawah ini untuk:
--    a. Memverifikasi status perusahaan contoh menjadi 'verified' agar
--       bisa langsung membuat & mempublikasikan lowongan.
--    b. Menambahkan beberapa lowongan contoh untuk perusahaan tersebut.
--
-- Ganti '<EMAIL_PERUSAHAAN_CONTOH>' di bawah dengan email yang benar-benar
-- sudah terdaftar di auth.users sebelum menjalankan blok ini.
-- =====================================================================

-- Contoh: set status perusahaan menjadi verified berdasarkan email
-- update companies c
-- set status = 'verified'
-- from profiles p
-- where c.user_id = p.id
--   and p.id = (select id from auth.users where email = '<EMAIL_PERUSAHAAN_CONTOH>');

-- Contoh: menambahkan lowongan contoh untuk perusahaan pertama yang verified
do $$
declare
  v_company_id uuid;
  v_category_id uuid;
  v_job_id uuid;
  v_skill_id uuid;
begin
  select id into v_company_id from companies where status = 'verified' limit 1;

  if v_company_id is not null then
    select id into v_category_id from job_categories where name = 'Teknologi & IT' limit 1;

    insert into jobs (
      company_id, category_id, title, description, responsibilities, requirements,
      benefits, location, work_type, duration, deadline, positions_available, major, status
    ) values (
      v_company_id, v_category_id,
      'Frontend Developer Intern',
      'Bergabung dengan tim engineering kami untuk membangun antarmuka produk yang digunakan ribuan pengguna setiap hari.',
      'Membangun komponen UI dengan React, berkolaborasi dengan tim desain, menulis kode yang bersih dan teruji.',
      'Menguasai dasar HTML/CSS/JavaScript, familiar dengan React menjadi nilai tambah, mau belajar hal baru.',
      'Sertifikat magang, uang saku bulanan, mentoring langsung dari senior engineer, kesempatan full-time.',
      'Jakarta Selatan', 'Hybrid', '3 Bulan', current_date + interval '30 days', 2,
      'Rekayasa Perangkat Lunak / Teknik Informatika', 'active'
    )
    returning id into v_job_id;

    select id into v_skill_id from skills where name = 'React' limit 1;
    if v_skill_id is not null then
      insert into job_skills (job_id, skill_id) values (v_job_id, v_skill_id) on conflict do nothing;
    end if;

    select id into v_skill_id from skills where name = 'JavaScript' limit 1;
    if v_skill_id is not null then
      insert into job_skills (job_id, skill_id) values (v_job_id, v_skill_id) on conflict do nothing;
    end if;

    insert into jobs (
      company_id, category_id, title, description, location, work_type, duration,
      deadline, positions_available, major, status
    ) values (
      v_company_id, v_category_id,
      'UI/UX Design Intern',
      'Bantu kami merancang pengalaman pengguna yang intuitif untuk aplikasi mobile dan web.',
      'Jakarta (Remote)', 'Remote', '2 Bulan', current_date + interval '21 days', 1,
      'Desain Komunikasi Visual', 'active'
    );

    raise notice 'Seed jobs berhasil dibuat untuk company_id: %', v_company_id;
  else
    raise notice 'Tidak ada perusahaan dengan status verified. Lewati seeding jobs. Daftar & verifikasi perusahaan contoh terlebih dahulu.';
  end if;
end $$;
