-- seed.sql
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- ======================
-- USERS
-- ======================
INSERT INTO `users` (`id`, `display_name`, `email`, `password_hash`, `role`) VALUES
(1, 'Admin GameTopUp', 'admin@gametopup.com', '$2b$10$bppKKRHPleFWDR2TXpWO1O4ZQ5RmI/Zm6t8hQJxttsaM3Dfq6Ya5u', 1),
(2, 'Khach hang Demo 1', 'customer01@gametopup.com', '$2b$10$bppKKRHPleFWDR2TXpWO1O4ZQ5RmI/Zm6t8hQJxttsaM3Dfq6Ya5u', 0),
(3, 'Khach hang Demo 2', 'customer02@gametopup.com', '$2b$10$bppKKRHPleFWDR2TXpWO1O4ZQ5RmI/Zm6t8hQJxttsaM3Dfq6Ya5u', 0);

-- ======================
-- WALLETS
-- ======================
INSERT INTO `wallets` (`user_id`, `balance`) VALUES
(1, 1000000.00),
(2, 500000.00),
(3, 300000.00);

-- ======================
-- GAMES (Garena & HHGames)
-- ======================
INSERT INTO `games` (`id`, `name`, `image_url`, `is_active`) VALUES
(1, 'Free Fire', 'https://example.com/games/free-fire.png', 1),
(2, 'Lien Quan Mobile', 'https://example.com/games/lien-quan.png', 1),
(3, 'FIFA Online 4', 'https://example.com/games/fo4.png', 1),
(4, 'Call of Duty Mobile Garena', 'https://example.com/games/codm.png', 1),
(5, 'Undawn', 'https://example.com/games/undawn.png', 1),
(6, 'Dark War Survival', 'https://example.com/games/dark-war.png', 1),
(7, 'Last War: Survival', 'https://example.com/games/last-war.png', 1),
(8, 'Blood Strike: Vay Ham', 'https://example.com/games/blood-strike.png', 1),
(9, 'Magic Chess: Go Go', 'https://example.com/games/magic-chess.png', 1),
(10, 'Sky: Children of the Light', 'https://example.com/games/sky.png', 1),
(11, 'Age of Apes', 'https://example.com/games/age-of-apes.png', 1),
(12, 'Hanh Trinh Bat Tan', 'https://example.com/games/hanh-trinh-bat-tan.png', 1);

-- ======================
-- GAME PACKAGES
-- ======================
INSERT INTO `packages` (`id`, `name`, `game_id`, `sale_price`, `original_price`, `import_price`, `available_slots`) VALUES
(1, '100 Kim Cuong', 1, 20000, 25000, 16000, 100),
(2, '310 Kim Cuong', 1, 59000, 69000, 50000, 80),
(3, '1060 Kim Cuong', 1, 199000, 239000, 175000, 40),
(4, '40 Quan Huy', 2, 20000, 25000, 16000, 100),
(5, '200 Quan Huy', 2, 95000, 120000, 82000, 60),
(6, '999 Quan Huy', 2, 399000, 459000, 350000, 25),
(7, '100 FC', 3, 25000, 30000, 20000, 120),
(8, '500 FC', 3, 119000, 139000, 100000, 70),
(9, '2200 FC', 3, 459000, 529000, 400000, 30),
(10, '60 CP', 4, 22000, 27000, 18000, 100),
(11, '420 CP', 4, 99000, 119000, 85000, 70),
(12, '880 CP', 4, 199000, 239000, 175000, 40),
(13, '100 RC', 5, 25000, 30000, 20000, 100),
(14, '500 RC', 5, 119000, 149000, 100000, 60),
(15, 'Starter Pack', 6, 49000, 59000, 42000, 100),
(16, 'Elite Survival Pack', 6, 199000, 239000, 175000, 40),
(17, '100 Diamonds', 7, 20000, 25000, 16000, 120),
(18, '500 Diamonds', 7, 95000, 120000, 82000, 60),
(19, '60 Gold', 8, 22000, 27000, 18000, 100),
(20, '300 Gold', 8, 99000, 119000, 85000, 60),
(21, 'Chess Pass', 9, 49000, 59000, 42000, 100),
(22, 'Magic Bundle', 9, 119000, 149000, 100000, 50),
(23, 'Season Pass', 10, 119000, 149000, 100000, 60),
(24, 'Candle Pack', 10, 49000, 59000, 42000, 80),
(25, '100 Banana Coin', 11, 20000, 25000, 16000, 100),
(26, '1000 Banana Coin', 11, 180000, 220000, 155000, 40),
(27, 'Adventure Pack', 12, 29000, 39000, 24000, 100),
(28, 'Infinity Pass', 12, 119000, 149000, 100000, 50);

-- ======================
-- GAME ACCOUNTS
-- ======================
INSERT INTO `game_accounts` (`user_id`, `game_id`, `name`, `account_identifier`, `server`, `is_default`) VALUES
(2, 1, 'Acc Chinh Free Fire', 'ff_998877', 'VN', 1),
(2, 2, 'Acc Leo Rank Lien Quan', 'lq_223344', 'Mat Troi', 0),
(3, 8, 'Blood Strike Main', 'bs_556677', 'VN-1', 1),
(3, 10, 'Sky Chill Account', 'sky_778899', 'SEA', 0);

-- ======================
-- WALLET TRANSACTIONS
-- ======================
INSERT INTO `wallet_transactions` (`id`, `user_id`, `amount`, `balance_before`, `balance_after`, `type`) VALUES
(1, 2, 500000.00, 0.00, 500000.00, 1),
(2, 3, 300000.00, 0.00, 300000.00, 1);

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
