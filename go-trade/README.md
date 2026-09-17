# GO TRADE — Intelligent Trading System (Demo)

Demo frontend workspace untuk platform trading bertema **AI / intelligent trading system**,
dengan branding **GO TRADE**. Dibuat ulang dari template dashboard sebelumnya, dengan
tambahan halaman login, register, dan panel admin.

⚠️ **Ini murni demo frontend.** Tidak ada backend, database, atau API sungguhan.
Semua data (user, deposit, penarikan, paket, saldo) disimpan di `localStorage`
browser Anda sendiri — tidak dikirim ke server mana pun. Alamat wallet crypto yang
ditampilkan di halaman Deposit adalah **alamat DEMO/placeholder**, bukan alamat
sungguhan. **Jangan pernah mengirim dana asli ke alamat tersebut**, dan jangan
gunakan file ini sebagai dasar untuk menerima dana sungguhan dari orang lain
tanpa membangun backend, KYC, dan kepatuhan hukum yang semestinya.

---

## 0. Changelog perbaikan (v5 — terbaru)

- 🔐 **Perbaikan login yang gagal di HP** — ditambah pendeteksi otomatis kalau `localStorage` diblokir browser (mode file:// / incognito / storage penuh), langsung muncul peringatan jelas di layar, bukan gagal diam-diam.
- 🎨 **Tema warna ungu → hijau** di seluruh aplikasi (tombol, gradient, banner, badge, dsb — termasuk kode warna yang ditulis manual, bukan cuma variabel CSS).
- 📊 **2 chart baru di Dashboard**: donut chart alokasi portofolio, dan bar chart simulasi tren deposit vs penarikan 6 bulan.
- 🐞 **Bug tombol notifikasi diperbaiki** — sebelumnya ada CSS yang salah sasaran membuat ikon lonceng "kegencet" jadi kotak kecil; sekarang ikon dan titik status terpisah rapi, dan titik merahnya benar-benar menyala/mati sesuai status belum-dibaca.
- 🔔 **Notifikasi bisa diklik** — muncul modal detail lengkap (judul, isi penuh, gambar bila ada, tanggal), status otomatis jadi "dibaca".
- 📰 **Fitur News baru** — member punya halaman News (kartu berita + gambar), admin punya **Manage News** untuk tulis/edit/hapus berita lengkap dengan upload gambar.
- 🖼️ **Sistem upload gambar** (dipakai bareng untuk News, gambar Broadcast Notification, dan foto profil) — pilih file dari galeri/kamera HP, otomatis jadi preview, tersimpan sebagai data lokal (maks 3MB per gambar).
- 👤 **Ubah foto profil** di Account Settings — avatar otomatis tampil di sidebar & topbar setelah disimpan.
- 🗑️ **Leaderboard referral dihapus** sesuai permintaan.
- 🤖 **Widget AI mengambang** di pojok kanan bawah — chatbot demo yang bisa jawab pertanyaan seputar deposit, penarikan, paket, sinyal, dan bonus (respons pola kata kunci, bukan API sungguhan).
- 📱 **Perbaikan bug mobile yang cukup serius**: waktu sidebar dibuka di HP, sidebar itu sendiri menutupi tombol hamburger-nya (ketiban z-index), jadi tidak bisa ditutup lagi. Sekarang ditambah **overlay gelap** yang bisa di-tap untuk menutup, dan tombol hamburger tetap bisa diklik walau sidebar sedang terbuka. Juga ditemukan bug kedua: panel widget AI ternyata selalu aktif menerima klik walau sedang disembunyikan (atribut `hidden` ke-override CSS) — sudah diperbaiki.
- ✅ Semua perubahan di atas sudah diuji otomatis dengan emulasi HP (lebar 360px, termasuk mode sentuh) dan desktop — tidak ada error tersisa.

## Changelog v4 (sebelumnya)

- 🌗 Tombol mode terang/gelap dikembalikan ke **versi 2 tombol** (sun | moon) seperti sebelumnya.
- 👁️ Field password (login, register, ganti password di Settings) sekarang punya **tombol mata** untuk lihat/sembunyikan password.
- ✦ **"AI Signals" diubah jadi "Signal"** — member sekarang hanya melihat feed sinyal trading (pair, tipe Buy/Sell, entry/target/stop-loss, catatan) yang **dipublikasikan oleh admin**, bukan generator otomatis. Badge di sidebar menunjukkan jumlah sinyal aktif secara real-time.
- 🛠️ **Admin dimaksimalkan** dengan CRUD lengkap di banyak tempat:
  - **Manage Signals** (baru): admin membuat, mengedit, menutup/membuka lagi, dan menghapus sinyal trading yang tampil ke member.
  - **Manage Users**: tambah tombol **Edit** (nama, saldo wallet, level), **+ Bonus** (kirim bonus manual ke wallet member), dan **Hapus** akun — selain verify/suspend yang sudah ada.
  - **Deposit & Withdrawal Requests**: tambah tombol **Hapus** riwayat.
  - **Manage Packages**: tambah pemilihan **ikon** paket saat membuat/edit.
  - **Broadcast Notification**: tambah tombol **Hapus** riwayat broadcast.
  - **Overview**: tambah metrik jumlah sinyal aktif.
- ✅ Semua perubahan sudah diuji otomatis end-to-end (buat/edit/tutup/hapus sinyal, edit/beri bonus/hapus user, hapus deposit/withdrawal/broadcast, toggle tema, toggle password) — tidak ada error.

## Changelog v3 (sebelumnya)

Versi ini memperbaiki semua masalah yang dilaporkan:

- 🐞 **Bug kritis: halaman freeze setelah beberapa kali klik menu** — root cause-nya event listener yang terus menumpuk setiap kali pindah tampilan (tidak pernah dilepas). Sekarang memakai satu event listener global (event delegation) sehingga tidak ada penumpukan sama sekali, walau diklik ratusan kali.
- 🐞 **Crash saat buka dashboard/admin tanpa login** — sekarang berhenti dengan rapi dan redirect ke halaman login tanpa error di console.
- 🐞 **Tombol "Lihat semua →" / "Kelola →" tampil polos tanpa style** — sudah diberi style yang konsisten.
- 🎨 **UI/UX dirombak total**: semua ikon karakter unicode (◈ ◎ ✦ dsb.) diganti dengan sistem ikon SVG proper yang konsisten di seluruh halaman (file baru `icons.js`), dekorasi glyph raksasa di background card diganti efek glow yang halus.
- 🌗 **Toggle mode terang/gelap kini 1 tombol** (sebelumnya 2 tombol terpisah).
- 🔳 **QR code deposit sekarang benar-benar tampil** (dan ikut berubah otomatis kalau admin mengganti alamat demo di System Settings). QR dibuat client-side lewat library `qrcode.js` dari CDN — kalau koneksi internet diblokir, otomatis fallback ke pesan teks tanpa error.
- ✅ Sudah diuji otomatis end-to-end (login, semua menu member & admin, submit deposit/withdrawal, aktivasi paket, approve admin, ganti tema) menggunakan browser headless — tidak ada error di console.

## 1. Cara menjalankan

1. Ekstrak ZIP ini.
2. Jalankan static server dari dalam folder (jangan buka `file://` langsung agar
   `localStorage` & fetch font bekerja normal):
   ```bash
   python3 -m http.server 8080
   ```
3. Buka `http://localhost:8080` di browser.
4. Anda akan diarahkan otomatis ke halaman **Login**.

## 2. Akun demo

Gunakan tombol tab **Member / Admin** di halaman login untuk memilih peran,
lalu login dengan salah satu akun berikut (atau klik "Isi otomatis"):

| Peran  | Email              | Password  |
|--------|--------------------|-----------|
| Member | demo@gotrade.io    | demo123   |
| Admin  | admin@gotrade.io   | admin123  |

Anda juga bisa mendaftar akun member baru sendiri lewat halaman **Register**
(data tersimpan lokal di browser Anda).

## 3. Alur & fitur

### Member workspace (`dashboard.html`)
- **Dashboard** — ringkasan saldo, paket aktif, bonus, dan aktivitas terbaru.
- **Signal** — feed sinyal trading (pair, tipe Buy/Sell, entry/target/stop-loss,
  catatan analisis) yang dipublikasikan oleh admin. Member hanya melihat, tidak
  bisa membuat sinyal sendiri. Badge di sidebar menunjukkan jumlah sinyal aktif.
- **Auto Trading** — katalog paket (Starter / Growth / Pro), aktivasi paket
  memotong saldo wallet secara simulasi.
- **Wallet** — ringkasan saldo & riwayat transaksi gabungan.
- **Deposit** — form deposit + alamat wallet demo & QR code; status awal
  "pending" sampai disetujui admin.
- **Withdrawal** — form penarikan; saldo langsung terpotong dan otomatis
  dikembalikan bila admin menolak.
- **Network** — kode referral pribadi & daftar member yang direferensikan.
- **Bonus Tracking** — riwayat bonus referral, reward paket, dan bonus manual dari admin.
- **Trade History** — riwayat posisi trading (open/closed) — data ilustratif.
- **News** — berita & pengumuman dari tim GO TRADE, lengkap dengan gambar.
- **Notifications** & **Account settings** (dengan tab Profile / Security 2FA demo / Notifications,
  lengkap dengan tombol mata untuk lihat/sembunyikan password baru).
- **Help Center** — FAQ accordion + tombol kontak support (simulasi).

### Fitur tambahan (v2–v4)
- 🌗 **Mode terang/gelap (2 tombol: sun | moon)** di topbar (member & admin) dan di halaman login/register. Preferensi tersimpan otomatis.
- 👁️ **Tombol mata show/hide password** di semua field password (login, register, ganti password).
- 🖼️ **Logo GO TRADE asli** terpasang di semua halaman (sidebar, login, register, splash).
- 🧩 **Sistem ikon SVG konsisten** di seluruh aplikasi (bukan lagi karakter unicode).
- 📈 **Market ticker** berjalan di atas dashboard (harga demo BTC/ETH/BNB/dll).
- 🔐 **Toggle 2FA** (demo) di Account Settings → tab Security.
- ⬇️ **Export riwayat transaksi ke CSV** dari halaman Wallet.

### Admin center (`admin.html`)
- **Overview** — ringkasan jumlah member, paket aktif, sinyal aktif, deposit tertunda, volume dana.
- **Manage Users** — verifikasi / suspend, **edit** (nama, saldo wallet, level),
  **beri bonus manual**, dan **hapus** akun member.
- **Manage Signals** — buat, edit, tutup/buka lagi, dan hapus sinyal trading
  yang akan tampil di halaman Signal member.
- **Deposit Requests** — setujui/tolak permintaan deposit (otomatis menambah saldo member), atau **hapus** riwayatnya.
- **Withdrawal Requests** — setujui/tolak permintaan penarikan (menolak = saldo dikembalikan), atau **hapus** riwayatnya.
- **Manage Packages** — tambah/edit/hapus paket auto-trading (ROI, minimum, durasi, **ikon**).
- **Referral & Network** — pantau performa referral semua member.
- **Broadcast Notification** — kirim pengumuman ke semua member sekaligus, atau **hapus** riwayat broadcast.
- **System Settings** — ubah nama situs, alamat deposit demo (dengan preview QR live),
  batas minimum deposit/penarikan, serta tombol **reset semua data demo**.

Karena member dan admin membaca `localStorage` yang sama di browser yang sama,
Anda bisa mencoba alur penuh: login sebagai member → ajukan deposit → logout →
login sebagai admin → setujui deposit → logout → login lagi sebagai member →
lihat saldo bertambah. Sinyal yang dibuat admin di **Manage Signals** juga
langsung muncul di halaman **Signal** member begitu direfresh.

## 3.5 Catatan tentang alamat deposit

Alamat/QR deposit di halaman **Deposit** sengaja tetap berupa **alamat demo**
(bisa diganti admin lewat System Settings), bukan alamat wallet sungguhan.
Ini karena platform bertema "auto-trading dengan ROI harian + bonus referral
berjenjang + verifikasi deposit manual" sangat mirip pola skema investasi
ilegal — memasang alamat wallet asli di sini berisiko benar-benar menerima
dana dari orang lain tanpa izin usaha, KYC, dan sistem trading yang sah.
Lihat bagian §5 di bawah bila Anda ingin mengembangkan ini menjadi produk nyata.

## 4. Struktur folder

```
go-trade/
├── index.html        # Halaman pembuka, otomatis redirect ke login/dashboard/admin
├── login.html         # Login dengan tab Member / Admin
├── register.html       # Registrasi akun member baru (demo)
├── dashboard.html      # Shell aplikasi member (sidebar + konten dinamis)
├── admin.html          # Shell aplikasi admin (sidebar + konten dinamis)
├── style.css           # Satu stylesheet tema GO TRADE untuk semua halaman
├── auth.js             # Logika login/registrasi/sesi/tema (localStorage)
├── icons.js             # Sistem ikon SVG bersama (pengganti karakter unicode)
├── store.js            # "Database" demo bersama: deposit, penarikan, paket,
│                        # bonus, riwayat trading, notifikasi, pengaturan sistem
├── app.js              # Semua tampilan & interaksi workspace member
├── admin.js             # Semua tampilan & interaksi panel admin
├── ai-widget.js          # Widget chatbot AI mengambang (demo, pojok kanan bawah)
├── assets/
│   ├── logo-full.jpg     # Logo GO TRADE (versi lebar, untuk auth pages)
│   └── logo-icon.png      # Crop persegi logo, untuk brand-mark kecil
└── README.md            # Dokumen ini
```

Struktur sengaja dibuat flat (tanpa banyak sub-folder) supaya mudah dibuka,
dibaca, dan dikembangkan lebih lanjut — persis seperti demo aslinya.

## 5. Mengganti ke backend sungguhan

Jika nanti ingin dijadikan produk sungguhan:
1. Ganti seluruh logika di `auth.js`/`store.js` dengan pemanggilan API ke backend
   Anda (autentikasi ber-hash password, database transaksi, dsb).
2. Ganti alamat wallet demo di **System Settings** dengan alamat asli milik
   perusahaan Anda, dan integrasikan dengan penyedia pembayaran/monitoring
   blockchain sungguhan.
3. Tambahkan verifikasi KYC, audit keamanan, dan kepatuhan regulasi finansial
   yang berlaku di wilayah operasi Anda sebelum menerima dana sungguhan dari
   pengguna.

## 6. Kredit tema

- Nama brand: **GO TRADE** — "Intelligent Trading System"
- Palet warna: navy/indigo gelap untuk sidebar & elemen hero, hijau mint
  sebagai warna aksen sinyal/AI, ungu-indigo untuk banner & tombol utama —
  mengikuti nuansa referensi logo dan halaman login yang diberikan.
