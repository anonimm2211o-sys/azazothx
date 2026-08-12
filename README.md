# AZAZOTHX HUB

Website katalog + admin panel + order QRIS/bukti pembayaran → Telegram.

## Deploy
1. Import repo ini ke Vercel.
2. Aktifkan Vercel Blob dan buat `BLOB_READ_WRITE_TOKEN`.
3. Tambahkan environment variables:
   - `BLOB_READ_WRITE_TOKEN`
   - `ADMIN_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. Deploy ulang.
5. Buka `/admin.html`, masukkan `ADMIN_KEY`, lalu isi katalog sendiri.

Katalog awal sengaja kosong.

Catatan: QRIS di versi ini disiapkan sebagai bagian dari flow order; gambar QRIS bisa ditambahkan sebagai setting lanjutan. Token Telegram dan admin key jangan pernah ditaruh di frontend/public repo.
