# CRM 客戶管理後台 API

Node.js · Express · MySQL · JWT · RESTful API

## 專案功能

- 會員登入 / 註冊，JWT Token 驗證
- 管理員 / 一般用戶角色權限控管
- 客戶資料完整 CRUD
- 訂單記錄管理（含客戶關聯）
- 支援關鍵字搜尋、狀態過濾

---

## 資料夾結構

```
crm-api/
├── db/
│   └── schema.sql          # 資料庫建表 SQL
├── src/
│   ├── config/
│   │   └── db.js           # MySQL 連線池
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── auth.js         # JWT 驗證
│   │   └── role.js         # 角色權限控管
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   └── orders.js
│   └── app.js              # 主程式入口
├── .env.example
├── package.json
└── README.md
```

---

## 快速開始

### 1. 安裝套件
```bash
npm install
```

### 2. 設定環境變數
```bash
cp .env.example .env
# 填入 DB_PASSWORD、JWT_SECRET
```

### 3. 建立資料庫
```bash
mysql -u root -p < db/schema.sql
```

### 4. 啟動伺服器
```bash
npm run dev   # 開發模式（需安裝 nodemon）
npm start     # 正式模式
```

---

## API 文件

### 🔐 Auth

| Method | Endpoint          | 說明         | 權限     |
|--------|-------------------|--------------|----------|
| POST   | /api/auth/register | 用戶註冊    | 無       |
| POST   | /api/auth/login    | 用戶登入    | 無       |
| GET    | /api/auth/me       | 取得自己資訊 | 需登入  |

**POST /api/auth/register**
```json
{ "name": "王小明", "email": "ming@example.com", "password": "123456" }
```

**POST /api/auth/login** → 回傳 token
```json
{ "email": "admin@example.com", "password": "admin1234" }
```

> 取得 token 後，後續請求加入 Header：
> `Authorization: Bearer <token>`

---

### 👥 Customers

| Method | Endpoint            | 說明               | 權限       |
|--------|---------------------|--------------------|------------|
| GET    | /api/customers       | 取得所有客戶       | 需登入     |
| GET    | /api/customers/:id   | 取得單一客戶+訂單  | 需登入     |
| POST   | /api/customers       | 新增客戶           | 需登入     |
| PUT    | /api/customers/:id   | 更新客戶           | 需登入     |
| DELETE | /api/customers/:id   | 刪除客戶           | 僅 admin   |

**Query 參數**
- `GET /api/customers?search=關鍵字` — 搜尋姓名、Email、公司

**POST / PUT body**
```json
{
  "name": "陳大文",
  "email": "david@company.com",
  "phone": "0912-345-678",
  "company": "大文科技",
  "address": "台北市信義區...",
  "note": "重要客戶"
}
```

---

### 📦 Orders

| Method | Endpoint         | 說明         | 權限       |
|--------|------------------|--------------|------------|
| GET    | /api/orders       | 取得所有訂單 | 需登入     |
| GET    | /api/orders/:id   | 取得單一訂單 | 需登入     |
| POST   | /api/orders       | 新增訂單     | 需登入     |
| PUT    | /api/orders/:id   | 更新訂單     | 需登入     |
| DELETE | /api/orders/:id   | 刪除訂單     | 僅 admin   |

**Query 參數**
- `GET /api/orders?status=pending` — 過濾狀態
- `GET /api/orders?customer_id=1` — 過濾客戶

**訂單狀態**：`pending` / `confirmed` / `shipped` / `completed` / `cancelled`

**POST / PUT body**
```json
{
  "customer_id": 1,
  "title": "2024 Q1 採購合約",
  "amount": 150000,
  "status": "confirmed",
  "order_date": "2024-01-15",
  "note": "含安裝費"
}
```

---

## 技術棧

- **Runtime**：Node.js
- **Framework**：Express
- **Database**：MySQL（mysql2/promise 連線池）
- **驗證**：JWT（jsonwebtoken）
- **密碼加密**：bcryptjs
- **部署**：Render / Railway / AWS EC2

---

## 預設測試帳號

| 角色  | Email               | 密碼       |
|-------|---------------------|------------|
| admin | admin@example.com   | admin1234  |