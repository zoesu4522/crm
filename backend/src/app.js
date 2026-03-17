const cors = require('cors')
require('dotenv').config();
const express = require('express');
const app = express();

app.use(cors({
  origin: '*',
}))
app.use(express.json());

//  Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/customers', require('./routes/customers'))
app.use('/api/orders', require('./routes/orders'))

// Health check
app.get('/', (req, res) => res.json({ message: 'CRM API is running 🚀' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: '路由不存在' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '伺服器內部錯誤' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
