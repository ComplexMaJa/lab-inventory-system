-- ============================================================
--  Lab Inventory System — Database Setup
--  Import this file via phpMyAdmin:
--  Database > Import > Choose file > db_lab_komputer.sql
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

-- ------------------------------------------------------------
-- Create & select database
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `db_lab_komputer`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_lab_komputer`;

-- ------------------------------------------------------------
-- Table: inventaris
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventaris` (
  `id_barang`   INT           NOT NULL AUTO_INCREMENT,
  `nama_barang` VARCHAR(100)  NOT NULL,
  `kode_aset`   VARCHAR(50)   DEFAULT NULL,
  `kondisi`     ENUM('Baik','Rusak','Perbaikan') NOT NULL DEFAULT 'Baik',
  `stok`        INT           NOT NULL DEFAULT 0,
  `tgl_update`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_barang`),
  UNIQUE KEY `uq_kode_aset` (`kode_aset`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Sample data (optional — delete rows you don't need)
-- ------------------------------------------------------------
INSERT INTO `inventaris` (`nama_barang`, `kode_aset`, `kondisi`, `stok`) VALUES
  ('Komputer PC',          'ASET-PC-001',  'Baik',      20),
  ('Monitor LCD 24"',      'ASET-MON-001', 'Baik',      20),
  ('Keyboard USB',         'ASET-KB-001',  'Baik',      18),
  ('Mouse Optik',          'ASET-MS-001',  'Rusak',      3),
  ('Kabel LAN Cat6',       'ASET-LAN-001', 'Perbaikan',  5),
  ('Switch 24-Port',       'ASET-SW-001',  'Baik',       2),
  ('UPS 1200VA',           'ASET-UPS-001', 'Baik',       4),
  ('Proyektor HDMI',       'ASET-PRJ-001', 'Perbaikan',  1),
  ('Webcam 1080p',         'ASET-WC-001',  'Baik',       6),
  ('Headset Audio',        'ASET-HS-001',  'Rusak',      2);

COMMIT;
