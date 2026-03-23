-- Create database
CREATE DATABASE IF NOT EXISTS sap_test_results;
USE sap_test_results;

-- Test runs table
CREATE TABLE IF NOT EXISTS test_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id VARCHAR(100) NOT NULL,
  run_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_tests INT DEFAULT 0,
  passed INT DEFAULT 0,
  failed INT DEFAULT 0,
  skipped INT DEFAULT 0,
  total_duration_ms BIGINT DEFAULT 0
);

-- Individual test results table
CREATE TABLE IF NOT EXISTS test_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id VARCHAR(100) NOT NULL,
  test_name VARCHAR(500) NOT NULL,
  suite_name VARCHAR(500),
  status VARCHAR(20) NOT NULL,
  duration_ms BIGINT DEFAULT 0,
  error_message TEXT,
  po_number VARCHAR(20),
  screenshot_path VARCHAR(500),
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
