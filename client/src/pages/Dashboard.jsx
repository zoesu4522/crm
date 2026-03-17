import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const STATUS_MAP = {
  pending: '待確認', confirmed: '已確認', shipped: '已出貨',
  completed: '完成', cancelled: '取消',
}
const STATUS_COLOR = {
  pending: '#f59e0b', confirmed: '#6c63ff', shipped: '#a78bfa',
  completed: '#22d3a5', cancelled: '#f43f5e',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ customers: 0, orders: 0, revenue: 0, pending: 0 })
  const [chartData, setChartData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, oRes] = await Promise.all([
          api.get('/api/customers'),
          api.get('/api/orders'),
        ])
        const customers = cRes.data
        const orders = oRes.data

        const revenue = orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + Number(o.amount), 0)
        const pending = orders.filter(o => o.status === 'pending').length

        setStats({ customers: customers.length, orders: orders.length, revenue, pending })
        setRecentOrders(orders.slice(0, 6))

        // Status chart data
        const statusCount = {}
        orders.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1 })
        setChartData(Object.entries(statusCount).map(([status, count]) => ({
          name: STATUS_MAP[status] || status, count, status,
        })))
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-title">歡迎回來，{user?.name} 👋</div>
        <div className="page-subtitle">以下是你的 CRM 總覽</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">客戶總數</div>
          <div className="stat-value accent">{stats.customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">訂單總數</div>
          <div className="stat-value">{stats.orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">已完成營收</div>
          <div className="stat-value success">
            ${stats.revenue.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">待處理訂單</div>
          <div className="stat-value warning">{stats.pending}</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">訂單狀態分佈</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#9090b0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9090b0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3d', borderRadius: 8 }}
                labelStyle={{ color: '#e8e8f0' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLOR[entry.status] || '#6c63ff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">最新訂單</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>訂單名稱</th>
                  <th>金額</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text2)' }}>暫無訂單</td></tr>
                ) : recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>{o.title}</td>
                    <td>${Number(o.amount).toLocaleString()}</td>
                    <td><span className={`badge badge-${o.status}`}>{STATUS_MAP[o.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
