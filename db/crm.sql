
--  CRM 資料庫結構


CREATE DATABASE IF NOT EXISTS crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_db;

-- 使用者（含角色權限）
CREATE TABLE users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 客戶資料
CREATE TABLE customers (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE,
  phone       VARCHAR(30),
  company     VARCHAR(150),
  address     TEXT,
  note        TEXT,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 訂單記錄
CREATE TABLE orders (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  customer_id  INT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  amount       DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status       ENUM('pending', 'confirmed', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  order_date   DATE NOT NULL,
  note         TEXT,
  created_by   INT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- admin（密碼：admin1234）
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');