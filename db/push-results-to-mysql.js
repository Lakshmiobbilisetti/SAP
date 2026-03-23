const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dbConfig = require('./config');

const ALLURE_RESULTS_DIR = path.join(__dirname, '..', 'allure-results');

async function pushResultsToMySQL() {
  // Read all result JSON files from allure-results
  const files = fs.readdirSync(ALLURE_RESULTS_DIR).filter(f => f.endsWith('-result.json'));

  if (files.length === 0) {
    console.log('No test results found in allure-results/. Run tests first.');
    return;
  }

  const results = files.map(f => {
    const content = fs.readFileSync(path.join(ALLURE_RESULTS_DIR, f), 'utf-8');
    return JSON.parse(content);
  });

  // Generate a unique run ID
  const runId = `RUN_${Date.now()}`;
  const runDate = new Date();

  // Calculate summary
  const total = results.length;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const totalDuration = results.reduce((sum, r) => sum + ((r.stop || 0) - (r.start || 0)), 0);

  // Connect to MySQL
  const connection = await mysql.createConnection(dbConfig);

  // Insert test run summary
  await connection.execute(
    'INSERT INTO test_runs (run_id, run_date, total_tests, passed, failed, skipped, total_duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [runId, runDate, total, passed, failed, skipped, totalDuration]
  );
  console.log(`Test Run: ${runId}`);
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);

  // Insert individual test results
  for (const result of results) {
    const duration = (result.stop || 0) - (result.start || 0);
    const errorMessage = result.statusDetails?.message || null;
    const suiteName = result.labels?.find(l => l.name === 'subSuite')?.value || result.labels?.find(l => l.name === 'suite')?.value || null;

    // Extract PO number from stdout attachment if available
    let poNumber = null;
    if (result.attachments) {
      const stdoutAttachment = result.attachments.find(a => a.name === 'stdout');
      if (stdoutAttachment) {
        const stdoutPath = path.join(ALLURE_RESULTS_DIR, stdoutAttachment.source);
        if (fs.existsSync(stdoutPath)) {
          const stdout = fs.readFileSync(stdoutPath, 'utf-8');
          const poMatch = stdout.match(/PO Number Created:\s*(\d{10})/);
          if (poMatch) poNumber = poMatch[1];
        }
      }
    }

    // Find screenshot attachment
    let screenshotPath = null;
    if (result.attachments) {
      const screenshot = result.attachments.find(a => a.type === 'image/png');
      if (screenshot) screenshotPath = screenshot.source;
    }

    await connection.execute(
      'INSERT INTO test_results (run_id, test_name, suite_name, status, duration_ms, error_message, po_number, screenshot_path, executed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [runId, result.name, suiteName, result.status, duration, errorMessage, poNumber, screenshotPath, new Date(result.start)]
    );

    console.log(`  ${result.status === 'passed' ? 'PASS' : 'FAIL'} | ${result.name} | ${duration}ms${poNumber ? ' | PO: ' + poNumber : ''}`);
  }

  await connection.end();
  console.log('\nResults pushed to MySQL successfully!');
}

pushResultsToMySQL().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
