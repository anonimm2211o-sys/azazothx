import { list, put, del } from "@vercel/blob";
import crypto from "crypto";

const DATA = "azazothx/products.json";

function auth(req) {
  return req.headers["x-admin-key"] === process.env.ADMIN_KEY;
}
async function readProducts() {
  try {
    const r = await list({ prefix: DATA });
    const f = r.blobs.find(x => x.pathname === DATA);
    if (!f) return [];
    return await (await fetch(f.url)).json();
  } catch { return []; }
}
async function saveProducts(products) {
  await put(DATA, JSON.stringify(products), { access: "public", addRandomSuffix: false, contentType: "application/json" });
}
export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query.admin === "1" && !auth(req)) return res.status(401).json({error:"Unauthorized"});
    return res.status(200).json(await readProducts());
  }
  if (!auth(req)) return res.status(401).json({error:"Unauthorized"});
  const products = await readProducts();

  if (req.method === "DELETE") {
    const id = String(req.query.id || "");
    const next = products.filter(p => p.id !== id);
    await saveProducts(next);
    return res.status(200).json({ok:true});
  }

  if (req.method === "POST") {
    const form = await req.formData();
    const id = String(form.get("id") || crypto.randomUUID());
    const existing = products.find(p => p.id === id);
    let image = existing?.image || "";
    const file = form.get("image");
    if (file && typeof file !== "string" && file.size) {
      const blob = await put(`azazothx/images/${crypto.randomUUID()}-${file.name}`, file, { access: "public" });
      image = blob.url;
    }
    const product = {
      id,
      name: String(form.get("name") || ""),
      category: String(form.get("category") || ""),
      price: Number(form.get("price") || 0),
      stock: Number(form.get("stock") || 0),
      description: String(form.get("description") || ""),
      specs: String(form.get("specs") || ""),
      image
    };
    const next = existing ? products.map(p => p.id === id ? product : p) : [...products, product];
    await saveProducts(next);
    return res.status(200).json(product);
  }
  res.status(405).end();
}