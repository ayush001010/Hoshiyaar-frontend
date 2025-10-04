import { build } from 'vite';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Build the application
await build();

// Function to copy file if it exists
function copyIfExists(source, dest) {
  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log(`✅ Copied ${source} to ${dest}`);
    return true;
  }
  return false;
}

// Copy all redirect and configuration files
const filesToCopy = [
  { source: 'public/_redirects', dest: 'dist/_redirects' },
  { source: 'public/404.html', dest: 'dist/404.html' },
  { source: 'public/.htaccess', dest: 'dist/.htaccess' },
  { source: 'vercel.json', dest: 'dist/vercel.json' },
  { source: 'netlify.toml', dest: 'dist/netlify.toml' }
];

let copiedCount = 0;
filesToCopy.forEach(({ source, dest }) => {
  if (copyIfExists(source, dest)) {
    copiedCount++;
  }
});

// Ensure dist directory exists
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

console.log(`✅ SPA build completed with ${copiedCount} redirect files`);
console.log('✅ All SPA routing configurations applied');
