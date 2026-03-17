const db = require('../config/db');

/**
 * GET /api/customers
 * 取得所有客戶（支援搜尋 ?search=關鍵字）
 */
const getAll = async (req, res) => {
  const { search } = req.query;
  try {
    let sql = 'SELECT * FROM customers';
    const params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR email LIKE ? OR company LIKE ?';
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

/**
 * GET /api/customers/:id
 * 取得單一客戶（含訂單摘要）
 */
const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const [customer] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (customer.length === 0) return res.status(404).json({ message: '客戶不存在' });

    const [orders] = await db.query(
      'SELECT id, title, amount, status, order_date FROM orders WHERE customer_id = ? ORDER BY order_date DESC',
      [id]
    );

    res.json({ ...customer[0], orders });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

/**
 * POST /api/customers
 * 新增客戶
 */
const create = async (req, res) => {
  const { name, email, phone, company, address, note } = req.body;

  if (!name) return res.status(400).json({ message: '客戶姓名為必填' });

  try {
    const [result] = await db.query(
      'INSERT INTO customers (name, email, phone, company, address, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email || null, phone || null, company || null, address || null, note || null, req.user.id]
    );
    res.status(201).json({ message: '客戶新增成功', customerId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '此 Email 已存在' });
    }
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

/**
 * PUT /api/customers/:id
 * 更新客戶資料
 */
const update = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, address, note } = req.body;

  if (!name) return res.status(400).json({ message: '客戶姓名為必填' });

  try {
    const [existing] = await db.query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: '客戶不存在' });

    await db.query(
      'UPDATE customers SET name=?, email=?, phone=?, company=?, address=?, note=? WHERE id=?',
      [name, email || null, phone || null, company || null, address || null, note || null, id]
    );
    res.json({ message: '客戶資料更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

/**
 * DELETE /api/customers/:id
 * 刪除客戶（限管理員）
 */
const remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await db.query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: '客戶不存在' });

    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ message: '客戶已刪除' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
