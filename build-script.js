const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest, exclude = []) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        // Skip excluded files/directories
        if (exclude.includes(entry.name)) {
            continue;
        }
        
        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath, exclude);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('🏗️ Building for production...');

// Clean public directory
if (fs.existsSync('public')) {
    fs.rmSync('public', { recursive: true });
    console.log('🧹 Cleaned public directory');
}

// Create public directory
fs.mkdirSync('public');

// Files and directories to exclude from public
const excludeList = [
    'node_modules',
    '.git',
    '.vercel',
    'public',
    'dev-server.py',
    'build-script.js',
    'deploy.js',
    'test-deployment.js',
    'maintenance-toggle.js',
    'blog-generator.js',
    'sitemap-generator.js',
    'post-template.html',
    '.vercelignore',
    'package.json',
    'package-lock.json',
    'README.md',
    '.DS_Store',
    '.gitignore'
];

// Copy all files except excluded ones
console.log('📁 Copying files to public directory...');
copyRecursive('.', 'public', excludeList);

// Ensure critical files exist
const criticalFiles = [
    'public/index.html',
    'public/404.html',
    'public/styles.css',
    'public/script.js',
    'public/sitemap.xml'
];

let allCriticalFilesExist = true;
for (const file of criticalFiles) {
    if (!fs.existsSync(file)) {
        console.error(`❌ Critical file missing: ${file}`);
        allCriticalFilesExist = false;
    }
}

if (allCriticalFilesExist) {
    console.log('✅ All critical files copied successfully');
    console.log('✅ Build completed - ready for deployment');
} else {
    console.error('❌ Build failed - missing critical files');
    process.exit(1);
}