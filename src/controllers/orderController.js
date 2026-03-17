const db = require('../config/db');

/**
 * GET /api/orders
 * 取得所有訂單（支援過濾 ?status=pending&customer_id=1）
 */
const getAll = async (req, res) => {
  const { status, customer_id } = req.query;
  try {
    let sql = `
      SELECT o.*, c.name AS customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { sql += ' AND o.status = ?'; params.push(status); }
    if (customer_id) { sql += ' AND o.customer_id = ?'; params.push(customer_id); }

    sql += ' ORDER BY o.order_date DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

/**
 * GET /api/orders/:id
 * 取得單一訂單
 */
const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: '訂單不存在' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

/**
 * POST /api/orders
 * 新增訂單
 */
const create = async (req, res) => {
  const { customer_id, title, amount, status, order_date, note } = req.body;

  if (!customer_id || !title || !order_date) {
    return res.status(400).json({ message: 'customer_id、title、order_date 為必填' });
  }

  try {
    const [customerCheck] = await db.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (customerCheck.length === 0) return res.status(404).json({ message: '客戶不存在' });

    const [result] = await db.query(
      'INSERT INTO orders (customer_id, title, amount, status, order_date, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_id, title, amount || 0, status || 'pending', order_date, note || null, req.user.id]
    );
    res.status(201).json({ message: '訂單新增成功', orderId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

/**
 * PUT /api/orders/:id
 * 更新訂單
 */
const update = async (req, res) => {
  const { id } = req.params;
  const { title, amount, status, order_date, note } = req.body;

  if (!title || !order_date) {
    return res.status(400).json({ message: 'title、order_date 為必填' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: '訂單不存在' });

    await db.query(
      'UPDATE orders SET title=?, amount=?, status=?, order_date=?, note=? WHERE id=?',
      [title, amount || 0, status || 'pending', order_date, note || null, id]
    );
    res.json({ message: '訂單更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

/**
 * DELETE /api/orders/:id
 * 刪除訂單（限管理員）
 */
const remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await db.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: '訂單不存在' });

    await db.query('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ message: '訂單已刪除' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
