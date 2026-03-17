/**
 * 角色權限控管 Middleware
 * 使用方式：roleMiddleware('admin') 或 roleMiddleware('admin', 'user')
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '請先登入' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: '權限不足，無法執行此操作' });
    }

    next();
  };
};

module.exports = roleMiddleware;
