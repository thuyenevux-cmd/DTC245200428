-- ============================================================================
--  Hệ thống Quản lý Kho hàng — schema MySQL 8
--  Mô tả:  phiếu (document) là nguồn sự thật, sổ kho (stocks) là hệ quả.
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  role          ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(80) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       VARCHAR(20)  NOT NULL,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(120) NULL,
  phone      VARCHAR(40)  NULL,
  address    VARCHAR(255) NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_suppliers_code (code),
  KEY idx_suppliers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  sku           VARCHAR(40)   NOT NULL,
  name          VARCHAR(160)  NOT NULL,
  category_id   INT UNSIGNED  NULL,
  unit          VARCHAR(20)   NOT NULL DEFAULT 'cái',
  cost_price    DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  sale_price    DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  reorder_point INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  KEY idx_products_category (category_id),
  KEY idx_products_name (name),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Số lượng đang có của từng mã hàng. quantity luôn >= 0.
CREATE TABLE IF NOT EXISTS stocks (
  product_id INT UNSIGNED NOT NULL,
  quantity   INT           NOT NULL DEFAULT 0,
  committed  INT           NOT NULL DEFAULT 0,
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_stocks_product FOREIGN KEY (product_id)
    REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Phiếu nhập / phiếu xuất / phiếu điều chỉnh
CREATE TABLE IF NOT EXISTS stock_documents (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code        VARCHAR(30)   NOT NULL,
  type        ENUM('IN','OUT','ADJUST') NOT NULL,
  supplier_id INT UNSIGNED  NULL,
  note        VARCHAR(255)  NULL,
  user_id     INT UNSIGNED  NULL,
  total_value DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_documents_code (code),
  KEY idx_documents_type_created (type, created_at),
  CONSTRAINT fk_documents_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers (id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dòng chi tiết / sổ kho: quantity > 0 nghĩa là nhập, < 0 nghĩa là xuất
CREATE TABLE IF NOT EXISTS stock_movements (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  document_id INT UNSIGNED    NOT NULL,
  product_id  INT UNSIGNED    NOT NULL,
  quantity    INT             NOT NULL,
  unit_price  DECIMAL(14,2)   NOT NULL DEFAULT 0.00,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_movements_product_created (product_id, created_at),
  KEY idx_movements_document (document_id),
  CONSTRAINT fk_movements_document FOREIGN KEY (document_id)
    REFERENCES stock_documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_movements_product FOREIGN KEY (product_id)
    REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
