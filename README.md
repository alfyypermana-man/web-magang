# MagangKu — Platform PKL & Magang

Platform full-stack yang mempertemukan siswa/mahasiswa (Student) dengan perusahaan (Company) untuk PKL, magang, dan internship, dengan panel Admin untuk moderasi platform.

## Fitur

- **Autentikasi berbasis Supabase Auth** dengan 3 role: `admin`, `student`, `company`, disimpan di tabel `profiles` dan dilindungi Row Level Security (RLS) di setiap tabel.
- **Student**: registrasi, profil & kelengkapan profil, portfolio publik (dengan QR code), CV builder multi-template, cari & lamar lowongan, lowongan tersimpan, tracking status lamaran, jadwal interview + countdown, pesan ke perusahaan, notifikasi.
- **Company**: registrasi (status `pending` hingga diverifikasi admin), profil perusahaan, CRUD lowongan (draft/publish/tutup), kelola pelamar per lowongan & keseluruhan, ubah status lamaran, jadwalkan interview, pesan ke kandidat, notifikasi.
- **Admin**: dashboard statistik & grafik pertumbuhan, verifikasi/tolak/suspend perusahaan, moderasi lowongan, monitor lamaran, kelola laporan (reports), activity logs, kelola akun student.
- **Landing page publik**: hero + search, kategori, lowongan terbaru, statistik platform, cara kerja, testimonial, FAQ.
- Responsive (desktop sidebar, mobile bottom nav/drawer), loading skeleton, empty state, error state, toast, modal konfirmasi.

## Tech Stack

React 18 · Vite · Tailwind CSS · React Router · Supabase (Postgres, Auth, Storage, RLS) · Recharts · qrcode.react · Lucide Icons

## 1. Instalasi

```bash
npm install
cp .env.example .env
```

Isi `.env` dengan kredensial project Supabase Anda (Project Settings → API):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

> Jangan pernah menaruh `service_role` key di frontend / repo.

## 2. Setup Database Supabase

1. Buka Supabase Dashboard → **SQL Editor**.
2. Jalankan seluruh isi `supabase/schema.sql`. Script ini akan:
   - Membuat semua tabel (profiles, students, companies, jobs, applications, interviews, messages, notifications, portfolios, resumes, reports, activity_logs, dll).
   - Mengaktifkan **Row Level Security** dan seluruh policy di setiap tabel.
   - Membuat 5 **Storage bucket** publik: `avatars`, `company-logos`, `portfolio-images`, `resumes`, `certificates`, beserta policy upload/akses (setiap user hanya boleh menulis ke folder `{user_id}/...` miliknya sendiri).
   - Mengisi data referensi awal: kategori magang & daftar skill.
3. (Opsional, untuk development) jalankan `supabase/seed.sql` setelah Anda mendaftar 1 akun company contoh via aplikasi, untuk menambahkan beberapa lowongan contoh.

### Setup Autentikasi

- Aktifkan provider **Email** di Authentication → Providers.
- Untuk development, Anda bisa mematikan "Confirm email" di Authentication → Settings agar tidak perlu verifikasi email setiap testing (jangan lupa nyalakan lagi untuk production).
- Redirect URL untuk reset password: tambahkan `http://localhost:5173/reset-password` (dan domain produksi Anda) di Authentication → URL Configuration.

### Membuat Akun Admin

Admin **tidak bisa** mendaftar lewat halaman register (sesuai spesifikasi keamanan). Buat manual:

1. Supabase Dashboard → Authentication → Users → **Add user** (isi email & password, centang "Auto Confirm").
2. Salin User UID yang baru dibuat.
3. Jalankan di SQL Editor:
   ```sql
   insert into profiles (id, full_name, role)
   values ('<USER_UID_DARI_LANGKAH_2>', 'Admin MagangKu', 'admin');
   ```
4. Login di `/login` menggunakan email & password tersebut — Anda akan diarahkan ke `/admin/dashboard`.

## 3. Menjalankan Aplikasi

```bash
npm run dev       # development server
npm run build     # build production ke folder dist/
npm run preview   # preview hasil build
```

## 4. Struktur Folder

```
src/
  components/   # komponen UI reusable (Button styles via index.css, Badge, Modal, dll)
  contexts/     # AuthContext, ToastContext
  layouts/      # PublicLayout, DashboardLayout, Student/Company/AdminLayout
  lib/          # supabaseClient.js
  pages/
    public/     # landing, jobs, job detail, companies, login, register, dst
    student/    # dashboard, browse jobs, applications, portfolio, cv, dst
    company/    # dashboard, jobs CRUD, applicants, interviews, dst
    admin/      # dashboard, students, companies, jobs, reports, dst
  services/     # 1 file per domain, semua query Supabase terpusat di sini
  utils/
supabase/
  schema.sql    # skema database + RLS + storage policies (WAJIB dijalankan)
  seed.sql      # data contoh opsional untuk development
```

## 5. Keamanan

- Semua akses data sensitif diamankan lewat **Supabase RLS**, bukan hanya pengecekan role di frontend (`ProtectedRoute` di frontend hanya untuk UX/routing).
- Perusahaan baru berstatus `pending` dan **tidak dapat membuat lowongan aktif** sampai di-approve admin (ditegakkan lewat RLS policy `jobs_insert_own_company`, bukan hanya UI).
- File upload (avatar, logo, CV, dsb.) divalidasi tipe & ukuran di client (`storageService.js`) dan dibatasi oleh `file_size_limit` + `allowed_mime_types` di level bucket Supabase Storage.
- Tidak ada password atau `service_role` key yang disimpan di kode maupun database aplikasi.

## 6. Catatan Implementasi & Batasan yang Diketahui

Untuk menjaga scope tetap dapat dikelola sebagai satu paket kode, beberapa fitur pada spesifikasi asli diimplementasikan secara **disederhanakan** dan bisa dikembangkan lebih lanjut:

- **CV Builder**: mendukung beberapa template visual (Minimal/Modern/Classic) dan export ke PDF via dialog cetak browser (`window.print()`), bukan generator PDF di server.
- **Chat**: pesan tersimpan di tabel `messages` dan bisa di-upgrade ke real-time penuh dengan mengaktifkan Supabase Realtime pada tabel tersebut (helper `subscribeToThread` sudah disediakan di `messagesService.js` namun belum dipasang otomatis di semua halaman).
- **Rekomendasi lowongan**: menggunakan pencocokan sederhana berbasis jurusan siswa vs jurusan lowongan (bisa dikembangkan menjadi sistem skor multi-faktor: skill, lokasi, minat).
- **Sitemap & robots.txt**: `robots.txt` dasar disediakan; sitemap dinamis dapat ditambahkan sesuai kebutuhan deployment (mis. via endpoint serverless terpisah karena proyek ini SPA).

## 7. Deployment

- **GitHub**: push folder ini sebagai repository baru (`.gitignore` sudah menyertakan `node_modules`, `dist`, `.env`).
- **Vercel**: import repository, set Environment Variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di project settings, framework preset "Vite".
- **Supabase**: pastikan `schema.sql` sudah dijalankan di project production sebelum deploy, dan URL Configuration (redirect URLs) sudah menyertakan domain production untuk reset password.
