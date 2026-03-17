# CRM 前端

React · Vite · React Router · Axios · Recharts

## 快速開始

```bash
npm install
cp .env.example .env
npm run dev
```

打開 http://localhost:5173

## 頁面

- `/login` — 登入 / 註冊
- `/` — Dashboard 總覽（統計卡片 + 圖表）
- `/customers` — 客戶管理（CRUD + 搜尋）
- `/orders` — 訂單管理（CRUD + 狀態過濾）

## 部署（Vercel）

```bash
npm run build
# 上傳 dist/ 資料夾到 Vercel 或 Netlify
```

設定環境變數：`VITE_API_URL=https://crm-r13y.onrender.com`
