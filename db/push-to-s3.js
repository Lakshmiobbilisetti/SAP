const { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim();
  });
}

const BUCKET = process.env.S3_BUCKET || 'sap-test-automation-reports';
const REGION = process.env.AWS_REGION || 'ap-south-1';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ALLURE_REPORT_DIR = path.join(__dirname, '..', 'allure-report');
const ALLURE_RESULTS_DIR = path.join(__dirname, '..', 'allure-results');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const TESTS_DIR = path.join(__dirname, '..', 'tests');
const TEST_DATA_DIR = path.join(__dirname, '..', 'test-data');
const PAGES_DIR = path.join(__dirname, '..', 'pages');

async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log(`Bucket "${BUCKET}" exists.`);
  } catch {
    console.log(`Creating bucket "${BUCKET}"...`);
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log(`Bucket "${BUCKET}" created.`);
  }
}

async function uploadFile(filePath, s3Key) {
  const content = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
  };

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    Body: content,
    ContentType: contentTypes[ext] || 'application/octet-stream',
  }));
}

function getAllFiles(dir, prefix = '') {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const s3Path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, s3Path));
    } else {
      files.push({ fullPath, s3Path });
    }
  }
  return files;
}

async function pushToS3() {
  console.log('\n--- Pushing to S3 ---\n');
  await ensureBucket();

  const timestamp = new Date().toISOString().split('T')[0];
  const runFolder = `runs/${timestamp}-${Date.now()}`;
  let uploadCount = 0;

  // Upload Allure HTML Report
  if (fs.existsSync(ALLURE_REPORT_DIR)) {
    const files = getAllFiles(ALLURE_REPORT_DIR);
    console.log(`Uploading Allure Report (${files.length} files)...`);
    for (const file of files) {
      await uploadFile(file.fullPath, `${runFolder}/allure-report/${file.s3Path}`);
      uploadCount++;
    }
    console.log(`  Allure Report uploaded.`);
  }

  // Upload Screenshots
  if (fs.existsSync(SCREENSHOTS_DIR)) {
    const files = getAllFiles(SCREENSHOTS_DIR);
    console.log(`Uploading Screenshots (${files.length} files)...`);
    for (const file of files) {
      await uploadFile(file.fullPath, `${runFolder}/screenshots/${file.s3Path}`);
      uploadCount++;
    }
    console.log(`  Screenshots uploaded.`);
  }

  // Upload Raw Allure Results (JSON)
  if (fs.existsSync(ALLURE_RESULTS_DIR)) {
    const files = getAllFiles(ALLURE_RESULTS_DIR);
    console.log(`Uploading Raw Results (${files.length} files)...`);
    for (const file of files) {
      await uploadFile(file.fullPath, `${runFolder}/allure-results/${file.s3Path}`);
      uploadCount++;
    }
    console.log(`  Raw Results uploaded.`);
  }

  // Upload Test Scripts (.spec.js files)
  if (fs.existsSync(TESTS_DIR)) {
    const files = getAllFiles(TESTS_DIR);
    console.log(`Uploading Test Scripts (${files.length} files)...`);
    for (const file of files) {
      await uploadFile(file.fullPath, `${runFolder}/test-scripts/${file.s3Path}`);
      uploadCount++;
    }
    console.log(`  Test Scripts uploaded.`);
  }

  // Upload Test Data (JSON files)
  if (fs.existsSync(TEST_DATA_DIR)) {
    const files = getAllFiles(TEST_DATA_DIR);
    console.log(`Uploading Test Data (${files.length} files)...`);
    for (const file of files) {
      await uploadFile(file.fullPath, `${runFolder}/test-data/${file.s3Path}`);
      uploadCount++;
    }
    console.log(`  Test Data uploaded.`);
  }

  // Upload Page Objects
  if (fs.existsSync(PAGES_DIR)) {
    const files = getAllFiles(PAGES_DIR);
    console.log(`Uploading Page Objects (${files.length} files)...`);
    for (const file of files) {
      await uploadFile(file.fullPath, `${runFolder}/page-objects/${file.s3Path}`);
      uploadCount++;
    }
    console.log(`  Page Objects uploaded.`);
  }

  console.log(`\nTotal files uploaded: ${uploadCount}`);
  console.log(`S3 Location: s3://${BUCKET}/${runFolder}/`);
  console.log('\nDone! Results pushed to S3 successfully.');
}

pushToS3().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
