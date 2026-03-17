const jwt = require('jsonwebtoken');

/**
  驗證 JWT Token
 將解碼後的 user 資訊掛載至 req.user
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: '未提供 Token，請先登入' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token 無效或已過期' });
  }
};

module.exports = authMiddleware;
