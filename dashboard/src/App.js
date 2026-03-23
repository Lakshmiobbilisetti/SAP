import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (!summary || !summary.run) return <div className="loading">No test data found</div>;

  const { run, results } = summary;
  const passRate = run.total_tests > 0 ? ((run.passed / run.total_tests) * 100).toFixed(0) : 0;
  const totalDurationSec = (run.total_duration_ms / 1000).toFixed(1);

  const getStatusIcon = (status) => {
    if (status === 'passed') return '\u2705';
    if (status === 'failed') return '\u274C';
    return '\u23ED';
  };

  const getStatusClass = (status) => {
    if (status === 'passed') return 'status-passed';
    if (status === 'failed') return 'status-failed';
    return 'status-skipped';
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>SAP Test Automation Dashboard</h1>
          <p className="subtitle">SAP WebGUI Test Execution Results</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card card-pass-rate">
          <div className="card-value">{passRate}%</div>
          <div className="card-label">Pass Rate</div>
          <div className="progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                className="progress-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="progress-bar"
                strokeDasharray={`${passRate}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>

        <div className="card card-total">
          <div className="card-value">{run.total_tests}</div>
          <div className="card-label">Total Tests</div>
        </div>

        <div className="card card-passed">
          <div className="card-value">{run.passed}</div>
          <div className="card-label">Passed</div>
        </div>

        <div className="card card-failed">
          <div className="card-value">{run.failed}</div>
          <div className="card-label">Failed</div>
        </div>

        <div className="card card-duration">
          <div className="card-value">{totalDurationSec}s</div>
          <div className="card-label">Total Duration</div>
        </div>
      </div>

      {/* Run Info */}
      <div className="run-info">
        <span>Run ID: <strong>{run.run_id}</strong></span>
        <span>Date: <strong>{new Date(run.run_date).toLocaleString()}</strong></span>
      </div>

      {/* Test Results Table */}
      <div className="table-container">
        <h2>Test Execution Details</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Test Step</th>
              <th>Suite</th>
              <th>Status</th>
              <th>Duration</th>
              <th>PO Number</th>
              <th>Executed At</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.id} className={getStatusClass(result.status)}>
                <td>{index + 1}</td>
                <td className="test-name">{result.test_name}</td>
                <td className="suite-name">{result.suite_name || '-'}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(result.status)}`}>
                    {getStatusIcon(result.status)} {result.status.toUpperCase()}
                  </span>
                </td>
                <td className="duration">{formatDuration(result.duration_ms)}</td>
                <td>{result.po_number || '-'}</td>
                <td className="timestamp">
                  {result.executed_at ? new Date(result.executed_at).toLocaleTimeString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Powered by Claude + MCP (Model Context Protocol) + Playwright | Data from MySQL</p>
      </footer>
    </div>
  );
}

export default App;
