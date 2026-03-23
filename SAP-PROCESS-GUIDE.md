# SAP Test Automation — Complete Process Guide

## What is SAP?

**SAP** = **Systems, Applications, and Products** in Data Processing

It's a business software that large companies use to manage everything in one place.

### What does SAP do?

Think of SAP as the brain of a company — it connects all departments:

| Department | What SAP handles | SAP Module |
|-----------|-----------------|------------|
| **Purchasing** | Buy raw materials from vendors | MM (Materials Management) |
| **Sales** | Sell products to customers | SD (Sales & Distribution) |
| **Finance** | Track money in/out, taxes, payments | FI (Financial Accounting) |
| **HR** | Employee salary, attendance, hiring | HCM (Human Capital Management) |
| **Warehouse** | Track stock, inventory | WM (Warehouse Management) |
| **Manufacturing** | Plan & produce goods | PP (Production Planning) |

### Real-World Example

A company wants to buy 100 laptops from a vendor:

```
Step 1: Create Purchase Order (ME21N)     → "I want to buy 100 laptops"
Step 2: Goods Receipt (MIGO)              → "Laptops arrived at warehouse"
Step 3: Invoice Verification (MIRO)       → "Vendor sent the bill"
Step 4: Payment (F-53)                    → "Pay the vendor"
```

All these steps happen inside SAP — connected, tracked, and auditable.

### What is SAP Fiori / WebGUI?

- **SAP GUI** = Old desktop application (thick client)
- **SAP WebGUI** = Same SAP, but runs in a web browser (what we are testing)
- **SAP Fiori** = Modern, mobile-friendly UI on top of SAP

### Why do companies use SAP?

- One system for everything (no 10 different tools)
- Real-time data across departments
- Compliance & audit ready
- Used by 90% of Fortune 500 companies (Amazon, Apple, BMW, Shell, etc.)

---

## End to End Process

### Phase 1: Impact Analysis

**What:** Identify which SAP transactions/modules need testing.

```
Business Requirement / Change Request
       ↓
Identify impacted SAP modules
       ↓
Map affected transactions
       ↓
Determine test scope
```

**Example:**

| Change | Impacted Module | Transaction | Priority |
|--------|----------------|-------------|----------|
| New vendor onboarding | MM (Procurement) | ME21N (Create PO) | High |
| Price change | MM | ME22N (Change PO) | High |
| New plant added | MM/WM | MIGO (Goods Receipt) | Medium |
| Tax rule update | FI | MIRO (Invoice) | High |
| New material type | MM | MM01 (Create Material) | Medium |

**Output:** List of SAP transactions that need automated testing.

---

### Phase 2: Test Plan

**What:** Define what to test, how to test, and with what data.

```
Identified Transactions
       ↓
Define Test Scenarios (Positive + Negative)
       ↓
Prepare Test Data
       ↓
Design Page Objects (reusable actions)
       ↓
Review & Approve
```

**Example for ME21N (Create PO):**

| Test Case ID | Scenario | Type | Expected Result |
|-------------|----------|------|-----------------|
| PO_TC_001 | Create PO - Single Item | Positive | PO created with 10-digit number |
| PO_TC_002 | Create PO - Multiple Items | Positive | PO created with 2 line items |
| PO_TC_003 | Create PO - High Value | Positive | PO created successfully |
| PO_TC_004 | Create PO - No Supplier | Negative | Error: Enter a supplier |
| PO_TC_005 | Create PO - Zero Quantity | Negative | Error: Quantity must be > 0 |
| PO_TC_006 | Create PO - Invalid Material | Negative | Error: Material does not exist |
| PO_TC_007 | Create PO - No Purch Org | Negative | Error: Enter purchasing org |
| PO_TC_008 | Create PO - Past Date | Negative | Error: Date is in the past |

**Tools used:** Claude + MCP generates test cases, test data, and page objects automatically.

---

### Phase 3: Test Execution (Test Run)

**What:** Run automated tests against SAP WebGUI.

```
Claude + MCP + Playwright
       ↓
Open SAP WebGUI (Browser)
       ↓
Login → Navigate to Transaction → Fill Data → Validate
       ↓
Capture Screenshots at each step
       ↓
Generate Results (JSON + HTML + Allure)
       ↓
Push to MySQL + S3
```

**Commands:**

```bash
npx playwright test              → Runs all tests
node db/push-results-to-mysql.js → Results stored in MySQL
npx allure generate              → HTML report generated
```

**What gets stored where:**

| Storage | What | Purpose |
|---------|------|---------|
| **MySQL** | Test name, status, duration, PO number, timestamps | Queries & analytics |
| **S3** | Allure HTML report, screenshots, raw JSON | Viewing, sharing & archiving |
| **Local** | allure-results/, screenshots/ | Immediate debugging |

---

### Phase 4: Dashboard & Reporting

**What:** Visualize test results for management and tracking.

```
MySQL (structured data)
       ↓
Dashboard Tool (Grafana / Power BI / Metabase)
       ↓
CEO / Management views
```

**Dashboard Metrics:**

| Metric | Query Source | Visualization |
|--------|-------------|---------------|
| Total tests run | test_runs table | Counter |
| Pass/Fail ratio | test_runs table | Pie chart |
| Pass rate trend over time | test_runs by date | Line chart |
| Average test duration | test_results table | Bar chart |
| Failed tests list | test_results WHERE status='failed' | Table |
| PO numbers created | test_results WHERE po_number IS NOT NULL | Table |
| Module-wise coverage | test_results by suite_name | Bar chart |
| Test execution history | test_runs by run_date | Timeline |

---

## Complete Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SAP S/4HANA (EC2)                     │
│              WebGUI (44.197.54.157:44300)                │
└──────────────────────┬──────────────────────────────────┘
                       │
              Claude + MCP + Playwright
                       │
         ┌─────────────┼─────────────┐
         ↓             ↓             ↓
    Test Cases     Test Data     Page Objects
    (auto-gen)    (auto-gen)    (auto-gen)
         └─────────────┼─────────────┘
                       ↓
                  Test Execution
                       │
         ┌─────────────┼─────────────┐
         ↓             ↓             ↓
      MySQL           S3          Allure
   (analytics)    (storage)     (reports)
         │             │             │
         └─────────────┼─────────────┘
                       ↓
                   Dashboard
              (Grafana/Power BI)
                       ↓
                 CEO / Management
```

---

## Summary

| Phase | What | Tool | Output |
|-------|------|------|--------|
| Impact Analysis | Identify what to test | Manual / Claude | List of transactions |
| Test Plan | Design test cases & data | Claude + MCP | Test specs + test data JSON |
| Test Run | Execute automated tests | Playwright + MCP | Allure results + screenshots |
| Store Results | Save for analytics | MySQL + S3 | Structured data + files |
| Dashboard | Visualize & track | Grafana / Power BI | Charts & metrics for CEO |

---

## What We Are Doing

We are automating the testing of SAP WebGUI — so instead of a human manually clicking through ME21N to create a Purchase Order, Claude + Playwright does it automatically and verifies everything works correctly.
