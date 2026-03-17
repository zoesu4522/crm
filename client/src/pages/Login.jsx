import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { data } = await api.post('/api/auth/login', {
          email: form.email, password: form.password,
        })
        login(data.user, data.token)
        navigate('/')
      } else {
        await api.post('/api/auth/register', form)
        setMode('login')
        setError('')
        alert('註冊成功！請登入')
      }
    } catch (err) {
      setError(err.response?.data?.message || '操作失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">CRM<span>.</span></div>
        <div className="auth-sub">
          {mode === 'login' ? '登入你的帳號' : '建立新帳號'}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">姓名</label>
              <input
                className="form-input"
                placeholder="請輸入姓名"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">密碼</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={loading}
          >
            {loading ? '處理中...' : mode === 'login' ? '登入' : '註冊'}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <>還沒有帳號？<a onClick={() => setMode('register')}>立即註冊</a></>
          ) : (
            <>已有帳號？<a onClick={() => setMode('login')}>返回登入</a></>
          )}
        </div>
      </div>
    </div>
  )
}
