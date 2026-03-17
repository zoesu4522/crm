import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', email: '', phone: '', company: '', address: '', note: '' }

export default function Customers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCustomers = async (q = '') => {
    try {
      const { data } = await api.get('/api/customers', { params: q ? { search: q } : {} })
      setCustomers(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCustomers(search)
  }

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (c) => {
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', address: c.address || '', note: c.note || '' })
    setEditId(c.id); setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.put(`/api/customers/${editId}`, form)
      } else {
        await api.post('/api/customers', form)
      }
      setShowModal(false)
      fetchCustomers(search)
    } catch (err) {
      alert(err.response?.data?.message || '操作失敗')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('確定刪除此客戶？')) return
    try {
      await api.delete(`/api/customers/${id}`)
      fetchCustomers(search)
    } catch (err) {
      alert(err.response?.data?.message || '刪除失敗')
    }
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-title">客戶管理</div>
        <div className="page-subtitle">管理所有客戶資料</div>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          className="form-input search-input"
          placeholder="搜尋姓名、Email、公司..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-ghost">搜尋</button>
        <button type="button" className="btn btn-primary" onClick={openAdd}>＋ 新增客戶</button>
      </form>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">載入中...</div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <div>尚無客戶資料</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>姓名</th><th>Email</th><th>電話</th><th>公司</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: 'var(--text2)' }}>{c.email || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{c.phone || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{c.company || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>編輯</button>
                        {user?.role === 'admin' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>刪除</button>
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
              <div className="modal-title">{editId ? '編輯客戶' : '新增客戶'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">姓名 *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">電話</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">公司</label>
                <input className="form-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">地址</label>
                <input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
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
