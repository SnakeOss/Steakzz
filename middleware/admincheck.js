function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden: Admins only' });
}

module.exports = isAdmin;
