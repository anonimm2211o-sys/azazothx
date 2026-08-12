const crypto = require("crypto");

function createToken() {
  return crypto
    .createHmac("sha256", process.env.ADMIN_SECRET)
    .update("azazothx-admin")
    .digest("hex");
}

module.exports = async (req, res) => {
  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({
      error: "ADMIN_SECRET belum diset di Vercel"
    });
  }

  // LOGIN
  if (req.method === "POST") {
    const { secret } = req.body || {};

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({
        error: "Kode salah."
      });
    }

    return res.status(200).json({
      token: createToken()
    });
  }

  // CEK SESSION
  if (req.method === "GET") {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ")
      ? auth.slice(7)
      : "";

    if (token !== createToken()) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    return res.status(200).json({
      ok: true
    });
  }

  return res.status(405).json({
    error: "Method not allowed"
  });
};
