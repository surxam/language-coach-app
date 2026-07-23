const { verifyToken } = require("../utils/jwt");

// Protège une route : exige un header "Authorization: Bearer <token>".
// Si valide, attache req.user = { id, email, name } et continue.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentification requise." });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter." });
  }
}

module.exports = { requireAuth };
