import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.dirname(__filename);

/*
 * Production build, split by what each part is:
 *   frontend/ -> out/                 public website        -> frontend.zip (public_html/)
 *   backend/  -> backend/dist/backend/ admin portal         -> backend.zip  (public_html/backend/)
 *   apis/     -> (no build step)      Laravel REST API      -> apis.zip     (public_html/api/)
 */

console.log('=====================================================');
console.log('   Hope - Production Build (Website | Admin | APIs)  ');
console.log('=====================================================');

const frontendDir = path.join(rootDir, 'frontend');
const frontendOutDir = path.join(frontendDir, 'out');
const hopeOutDir = path.join(rootDir, 'out');
const backendDir = path.join(rootDir, 'backend');
const backendOutDir = path.join(backendDir, 'out');
const backendDistDir = path.join(backendDir, 'dist');
const adminDistDir = path.join(backendDistDir, 'backend');

const rm = (dir) => {
  if (!fs.existsSync(dir)) return;
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    console.log(`   Removed: ${dir}`);
  } catch (e) {
    console.warn(`   Warning removing ${dir}: ${e.message}`);
  }
};

const run = (label, cwd) => {
  console.log(`\n${label}`);
  try {
    execSync('npm run build', { cwd, stdio: 'inherit', shell: true });
  } catch (err) {
    console.error(`Build failed in ${cwd}`, err.message);
    process.exit(1);
  }
};

const move = (from, to) => {
  try {
    fs.renameSync(from, to);
  } catch {
    // fallback if an atomic rename is not possible (e.g. across drives / locked files)
    fs.cpSync(from, to, { recursive: true });
    rm(from);
  }
};

// 1. Clean previous builds
console.log('1. Cleaning old build artifacts...');
[frontendOutDir, hopeOutDir, backendOutDir, backendDistDir].forEach(rm);

// 2. Public website
run('2. Building the public website (frontend/)...', frontendDir);
move(frontendOutDir, hopeOutDir);
console.log(`   Website -> ${hopeOutDir}`);

// 3. Admin portal: built with basePath /backend, so the whole export is the backend folder.
//    Public files (brand, favicon) are served by the website, so their copies are dropped.
run('3. Building the admin portal (backend/)...', backendDir);
fs.mkdirSync(backendDistDir, { recursive: true });
move(backendOutDir, adminDistDir);
fs.readdirSync(path.join(backendDir, 'public')).forEach((name) => rm(path.join(adminDistDir, name)));
fs.copyFileSync(path.join(backendDir, 'deploy', '.htaccess'), path.join(adminDistDir, '.htaccess'));
console.log(`   Admin portal -> ${adminDistDir}`);

console.log('\n=====================================================');
console.log('   Build complete: 0 errors');
console.log('   Website:      ' + hopeOutDir);
console.log('   Admin portal: ' + adminDistDir);
console.log('   APIs:         ' + path.join(rootDir, 'apis') + ' (no build step)');
console.log('=====================================================\n');
