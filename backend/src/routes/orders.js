const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// 所有路由都需登入
router.use(auth);

router.get('/',    getAll);
router.get('/:id', getById);
router.post('/',   create);
router.put('/:id', update);
router.delete('/:id', role('admin'), remove); // 僅管理員可刪除

module.exports = router;
