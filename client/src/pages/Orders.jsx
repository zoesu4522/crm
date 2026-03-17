import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const STATUS_MAP = {
  pending: '待確認', confirmed: '已確認', shipped: '已出貨',
  completed: '完成', cancelled: '取消',
}
const emptyForm = { customer_id: '', title: '', amount: '', status: 'pending', order_date: '', note: '' }

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = async (status = '') => {
    try {
      const { data } = await api.get('/api/orders', { params: status ? { status } : {} })
      setOrders(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOrders()
    api.get('/api/customers').then(r => setCustomers(r.data)).catch(console.error)
  }, [])

  const handleFilter = (status) => { setFilterStatus(status); fetchOrders(status) }

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (o) => {
    setForm({
      customer_id: o.customer_id, title: o.title,
      amount: o.amount, status: o.status,
      order_date: o.order_date?.split('T')[0] || '',
      note: o.note || '',
    })
    setEditId(o.id); setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.put(`/api/orders/${editId}`, form)
      } else {
        await api.post('/api/orders', form)
      }
      setShowModal(false)
      fetchOrders(filterStatus)
    } catch (err) {
      alert(err.response?.data?.message || '操作失敗')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('確定刪除此訂單？')) return
    try {
      await api.delete(`/api/orders/${id}`)
      fetchOrders(filterStatus)
    } catch (err) {
      alert(err.response?.data?.message || '刪除失敗')
    }
  }

  const statusFilters = ['', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled']

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-title">訂單管理</div>
        <div className="page-subtitle">查看與管理所有訂單記錄</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {statusFilters.map(s => (
          <button
            key={s}
            className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => handleFilter(s)}
          >
            {s ? STATUS_MAP[s] : '全部'}
          </button>
        ))}
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={openAdd}>
          ＋ 新增訂單
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">載入中...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◇</div>
              <div>尚無訂單資料</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>訂單名稱</th><th>客戶</th><th>金額</th><th>日期</th><th>狀態</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500 }}>{o.title}</td>
                    <td style={{ color: 'var(--text2)' }}>{o.customer_name || '—'}</td>
                    <td>${Number(o.amount).toLocaleString()}</td>
                    <td style={{ color: 'var(--text2)' }}>{o.order_date?.split('T')[0]}</td>
                    <td><span className={`badge badge-${o.status}`}>{STATUS_MAP[o.status]}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(o)}>編輯</button>
                        {user?.role === 'admin' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>刪除</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editId ? '編輯訂單' : '新增訂單'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">客戶 *</label>
                <select className="form-select" value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} required>
                  <option value="">請選擇客戶</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">訂單名稱 *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">金額</label>
                  <input type="number" className="form-input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">訂單日期 *</label>
                  <input type="date" className="form-input" value={form.order_date} onChange={e => setForm({...form, order_date: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">狀態</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {Object.entries(STATUS_MAP).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">備註</label>
                <textarea className="form-textarea" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
