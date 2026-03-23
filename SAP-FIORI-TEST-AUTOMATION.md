# SAP Fiori Test Automation - Complete Guide

## Project Overview

Automated SAP WebGUI testing using **Claude + MCP (Model Context Protocol)** with **Playwright**. Claude interacts with SAP WebGUI directly through the MCP Server — generating test cases, test data, and page objects automatically without manual scripting.

---

## Prerequisites

1. **SAP Server Running** — AWS EC2 instance with SAP S/4HANA must be active and accessible at `44.197.54.157:44300`
2. **Node.js Installed** — Verify with:
   ```bash
   node -v
   npm -v
   ```
3. **Install Dependencies** — Run once in the project folder:
   ```bash
   cd c:/Users/Jayasri/Desktop/SAP
   npm install
   npx playwright install chromium
   ```
4. **Claude Code with MCP** — Already configured in `.mcp.json`

---

## Project Structure

```
SAP/
├── .mcp.json                          → MCP config for Claude
├── package.json                       → Project & dependencies
├── playwright.config.js               → Test settings
├── pages/
│   ├── LoginPage.js                   → Login actions
│   └── PurchaseOrderPage.js           → PO creation actions
├── test-data/
│   └── purchase-order-data.json       → All test data
├── tests/
│   ├── 01-fiori-login.spec.js         → Login tests (2 test cases)
│   ├── 02-create-purchase-order-fiori.spec.js → PO tests (8 test cases)
│   └── 03-po-creation-e2e.spec.js     → E2E step-by-step (7 steps)
├── screenshots/                       → Test screenshots
├── allure-results/                    → Raw Allure data
└── allure-report/                     → Generated Allure report
```

---

## File Descriptions

### .mcp.json — MCP Server Configuration
- Configures the Playwright MCP Server so Claude can interact with the browser directly
- Tells Claude to use `npx @playwright/mcp` with HTTPS error ignoring

### package.json — Project Setup
- Defines project name ("sap"), version, and dependencies
- Contains npm scripts:
  - `npm run test:login` — runs only login tests
  - `npm run test:po` — runs only PO creation tests
  - `npm run test:all` — runs all tests
  - `npm run report` — opens Playwright HTML report
- Dependencies: Playwright, Allure Reporter

### playwright.config.js — Playwright Configuration
- SAP WebGUI base URL: `44.197.54.157:44300`
- Browser: headed mode (not headless), 1920x1080 viewport
- Timeouts: 2 min per test, 30s for assertions, 60s for navigation
- Reporters: list (console), HTML, and Allure

### pages/LoginPage.js — Login Page Object
Reusable class for SAP login actions:
- `navigate()` — opens the SAP WebGUI URL
- `login()` — fills username, password, client and clicks Log On
- `isLoggedIn()` — checks if "SAP Easy Access" heading is visible
- `getErrorMessage()` — captures error messages for negative tests

### pages/PurchaseOrderPage.js — Purchase Order Page Object
Reusable class for ME21N transaction actions:
- `navigateToME21N()` — enters transaction code ME21N
- `fillSupplier()` — types supplier number
- `fillOrgData()` — fills Purch Org, Purch Group, Company Code
- `fillLineItem()` — fills Material, Qty, Date, Price, Plant, Storage Location
- `save()` — clicks Save button
- `getMessageBarText()` — reads success/error message
- `extractPONumber()` — extracts 10-digit PO number from message

### test-data/purchase-order-data.json — Test Data
- SAP environment URL, client, credentials
- 8 test case data sets:
  - 3 positive (single item, multi item, high value PO)
  - 5 negative (no supplier, zero qty, invalid material, no purch org, past date)

### tests/01-fiori-login.spec.js — Login Tests
- TC_LOGIN_001: Successful login to SAP
- TC_LOGIN_002: Login with invalid credentials (expects error)

### tests/02-create-purchase-order-fiori.spec.js — PO Creation Tests
- 8 test cases (PO_TC_001 to PO_TC_008)
- Each test logs in fresh, navigates to ME21N, and creates/validates a PO
- Covers both positive and negative scenarios

### tests/03-po-creation-e2e.spec.js — E2E Step-by-Step Flow
7 sequential tests sharing one browser session:
1. Open SAP WebGUI login page
2. Login with valid credentials
3. Navigate to ME21N (Create Purchase Order)
4. Fill supplier details
5. Fill organization data (Purch Org, Group, Company Code)
6. Fill line item details (Material, Qty, Date, Price, Plant)
7. Save and verify Purchase Order creation

Each step is a separate test in Allure report with screenshots.

---

## How to Run

| What | Command |
|------|---------|
| Run only login tests | `npx playwright test 01-fiori-login` |
| Run only PO tests | `npx playwright test 02-create-purchase-order-fiori` |
| Run E2E step-by-step | `npx playwright test 03-po-creation-e2e` |
| Run all tests | `npx playwright test` |
| Generate Allure report | `npx allure generate allure-results --clean -o allure-report && npx allure open allure-report` |
| Open HTML report | `npx playwright show-report` |

---

## Step-by-Step Workflow

1. **Start your SAP server** (EC2 instance)
2. **Verify SAP is accessible** — open `https://44.197.54.157:44300` in browser
3. **Run the test** — `npx playwright test 03-po-creation-e2e`
4. **Generate report** — `npx allure generate allure-results --clean -o allure-report && npx allure open allure-report`
5. **Take screenshots / record Loom video** for evidence

---

## Test Coverage Summary

| Area | Test Cases | Type |
|------|-----------|------|
| Login | 2 | Positive + Negative |
| Purchase Order - Single Item | 1 | Positive |
| Purchase Order - Multi Item | 1 | Positive |
| Purchase Order - High Value | 1 | Positive |
| Purchase Order - No Supplier | 1 | Negative |
| Purchase Order - Zero Qty | 1 | Negative |
| Purchase Order - Invalid Material | 1 | Negative |
| Purchase Order - No Purch Org | 1 | Negative |
| Purchase Order - Past Date | 1 | Negative |
| **Total** | **10** | |

---

## To Add More SAP Transactions

To extend this framework for more transactions (e.g., MIGO, MIRO):

1. Create a new page object in `pages/` (e.g., `GoodsReceiptPage.js`)
2. Add test data in `test-data/`
3. Create a new test file in `tests/`
4. Or simply ask **Claude + MCP** to navigate to the SAP screen and auto-generate everything

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SAP server not reachable | Start EC2 instance, check port 44300 in AWS Security Group |
| Session deactivated | Restart SAP server, verify credentials (VOLTUS / Apple#123$) |
| Tests timeout | Increase timeout in `playwright.config.js` |
| Allure report not generating | Run `npm install allure-commandline` and retry |
| Browser not installed | Run `npx playwright install chromium` |

---

## CEO Update

We automated SAP WebGUI Purchase Order creation (ME21N) using Claude + MCP with Playwright. Claude interacts with SAP WebGUI directly through the MCP Server — generating test cases, test data, and page objects automatically without manual scripting. The test successfully logs into SAP, navigates to ME21N, fills in supplier, org data, and line items, then creates a Purchase Order — all automated. We have generated the Allure Report as well.
