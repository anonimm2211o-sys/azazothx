import { put } from "@vercel/blob";
import { list } from "@vercel/blob";
import crypto from "crypto";

async function getProduct(id) {
  const r = await list({ prefix: "azazothx/products.json" });
  const f = r.blobs.find(x => x.pathname === "azazothx/products.json");
  if (!f) return null;
  const products = await (await fetch(f.url)).json();
  return products.find(p => p.id === id);
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const form = await req.formData();
    const productId = String(form.get("productId") || "");
    const buyer = String(form.get("buyer") || "");
    const contact = String(form.get("contact") || "");
    const proof = form.get("proof");
    const product = await getProduct(productId);
    if (!product) return res.status(404).json({error:"Produk tidak ditemukan."});
    if (product.stock <= 0) return res.status(400).json({error:"Produk sudah habis."});
    if (!buyer || !contact || !proof || typeof proof === "string") return res.status(400).json({error:"Data order atau bukti pembayaran belum lengkap."});

    const saved = await put(`azazothx/proofs/${crypto.randomUUID()}-${proof.name}`, proof, {access:"public"});
    const text = [
      "ðŸ›’ ORDER BARU â€” AZAZOTHX HUB",
      "",
      `Produk: ${product.name}`,
      `Kategori: ${product.category}`,
      `Harga: Rp ${product.price.toLocaleString("id-ID")}`,
      `Pembeli: ${buyer}`,
      `Kontak: ${contact}`,
      `Bukti: ${saved.url}`
    ].join("\n");

    const tg = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:"POST", headers:{"content-type":"application/json"},
      body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text})
    });
    if (!tg.ok) throw new Error("Telegram gagal menerima order.");
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method:"POST", headers:{"content-type":"application/json"},
      body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,photo:saved.url,caption:`Bukti pembayaran â€” ${product.name}`})
    });
    res.status(200).json({ok:true});
  } catch(e) {
    res.status(500).json({error:e.message || "Gagal memproses order."});
  }
}
