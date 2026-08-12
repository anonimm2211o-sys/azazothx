const { get, set } = require("./_store");
const crypto = require("crypto");

function createToken() {
  return crypto
    .createHmac("sha256", process.env.ADMIN_SECRET)
    .update("azazothx-admin")
    .digest("hex");
}

function isAdmin(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice(7)
    : "";

  return (
    process.env.ADMIN_SECRET &&
    token === createToken()
  );
}

module.exports = async (req, res) => {
  try {
    let products = await get();

    // PUBLIC — lihat katalog
    if (req.method === "GET") {
      return res.status(200).json(products);
    }

    // ADMIN — semua perubahan wajib login
    if (!isAdmin(req)) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    // TAMBAH
    if (req.method === "POST") {
      const product = {
        id: req.body.id || crypto.randomUUID(),
        name: req.body.name || "Produk",
        category: req.body.category || "",
        price: Number(req.body.price || 0),
        stock: Number(req.body.stock || 0),
        image: req.body.image || "",
        description: req.body.description || "",
        sold: Boolean(req.body.sold)
      };

      products.push(product);

      await set(products);

      return res.status(201).json(product);
    }

    const id = req.query.id;

    // EDIT
    if (req.method === "PUT") {
      const index = products.findIndex(
        product => String(product.id) === String(id)
      );

      if (index === -1) {
        return res.status(404).json({
          error: "Produk tidak ditemukan"
        });
      }

      products[index] = {
        ...products[index],
        ...req.body,
        id: products[index].id
      };

      await set(products);

      return res.status(200).json(products[index]);
    }

    // HAPUS
    if (req.method === "DELETE") {
      const before = products.length;

      products = products.filter(
        product => String(product.id) !== String(id)
      );

      if (products.length === before) {
        return res.status(404).json({
          error: "Produk tidak ditemukan"
        });
      }

      await set(products);

      return res.status(200).json({
        success: true
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};
