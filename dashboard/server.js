const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sap_test_results',
  port: 3306,
};

// Get all test runs
app.get('/api/runs', async (req, res) => {
  const conn = await mysql.createConnection(DB_CONFIG);
  const [rows] = await conn.execute('SELECT * FROM test_runs ORDER BY run_date DESC');
  await conn.end();
  res.json(rows);
});

// Get test results for a specific run
app.get('/api/results/:runId', async (req, res) => {
  const conn = await mysql.createConnection(DB_CONFIG);
  const [rows] = await conn.execute(
    'SELECT * FROM test_results WHERE run_id = ? ORDER BY executed_at',
    [req.params.runId]
  );
  await conn.end();
  res.json(rows);
});

// Get all test results
app.get('/api/results', async (req, res) => {
  const conn = await mysql.createConnection(DB_CONFIG);
  const [rows] = await conn.execute('SELECT * FROM test_results ORDER BY executed_at');
  await conn.end();
  res.json(rows);
});

// Get summary stats
app.get('/api/summary', async (req, res) => {
  const conn = await mysql.createConnection(DB_CONFIG);
  const [runs] = await conn.execute('SELECT * FROM test_runs ORDER BY run_date DESC LIMIT 1');
  const [results] = await conn.execute(
    'SELECT * FROM test_results WHERE run_id = ? ORDER BY executed_at',
    [runs[0]?.run_id || '']
  );
  await conn.end();
  res.json({ run: runs[0] || null, results });
});

app.listen(4000, () => {
  console.log('Dashboard API running on http://localhost:4000');
});
