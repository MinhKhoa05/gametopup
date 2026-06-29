-- schema.sql
-- Create database if not exists
-- USE game_topup_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role INT DEFAULT 0, -- 0: Member, 1: Admin, 2: Staff
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_display_name (display_name),
    INDEX idx_users_created (created_at)
) ENGINE=InnoDB;

-- 1.1 Table: wallets
CREATE TABLE IF NOT EXISTS wallets (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT SIGNED NOT NULL UNIQUE,
    balance DECIMAL(18, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallets_user (user_id)
) ENGINE=InnoDB;

-- 2. Table: games
CREATE TABLE IF NOT EXISTS games (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    image_url TEXT,
    image_relative_path TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Table: packages
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    image_url TEXT,
    image_relative_path TEXT NULL,
    game_id BIGINT SIGNED NOT NULL,
    sale_price DECIMAL(18, 2) NOT NULL,
    original_price DECIMAL(18, 2) NOT NULL,
    import_price DECIMAL(18, 2) NOT NULL,
    available_slots INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_package_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_packages_lookup (game_id, is_active)
) ENGINE=InnoDB;

-- 5. Table: game_accounts
CREATE TABLE IF NOT EXISTS game_accounts (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT SIGNED NOT NULL,
    game_id BIGINT SIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    account_identifier VARCHAR(150) NOT NULL,
    server VARCHAR(100),
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_account_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_account_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_accounts_user_sort (user_id, is_default, created_at)
) ENGINE=InnoDB;

-- 7. Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT SIGNED NOT NULL,
    game_account_info TEXT NOT NULL,
    package_id BIGINT SIGNED NOT NULL,
    package_name VARCHAR(150) NOT NULL,
    package_price DECIMAL(18, 2) NOT NULL,
    package_cost DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    assigned_to BIGINT SIGNED,
    assigned_at DATETIME,
    status INT NOT NULL, -- 1: Pending, 2: Processing, 3: Completed, 4: Cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    INDEX idx_orders_user_sort (user_id, created_at),
    INDEX idx_orders_status (status)
) ENGINE=InnoDB;

-- 6. Table: wallet_transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT SIGNED NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    balance_before DECIMAL(18, 2) NOT NULL,
    balance_after DECIMAL(18, 2) NOT NULL,
    type INT NOT NULL, -- 1: Deposit, 2: Withdraw, 3: PurchaseOrder, 4: Refund
    reference_id VARCHAR(128) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tx_user_sort (user_id, created_at)
) ENGINE=InnoDB;

-- 6.1 Table: wallet_deposits
CREATE TABLE IF NOT EXISTS wallet_deposits (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT SIGNED NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    transfer_content VARCHAR(128) NOT NULL,
    status INT NOT NULL, -- 1: Pending, 2: UserConfirmed, 3: Approved, 4: Rejected
    user_confirmed_at DATETIME NULL,
    reviewed_by BIGINT SIGNED NULL,
    reviewed_at DATETIME NULL,
    admin_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_deposit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_deposit_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_deposits_user_sort (user_id, created_at),
    INDEX idx_deposits_status_sort (status, created_at)
) ENGINE=InnoDB;

-- 8. Table: order_history
CREATE TABLE IF NOT EXISTS order_history (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT SIGNED NOT NULL,
    from_status INT NOT NULL,
    to_status INT NOT NULL,
    note TEXT,
    action_by BIGINT SIGNED NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_history_order_sort (order_id, created_at)
) ENGINE=InnoDB;

-- 9. Table: refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT SIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT SIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME NULL,
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
