const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            // Skip node_modules, .git, and source directories
            if (!['node_modules', '.git', 'src', 'public'].includes(entry.name)) {
                copyRecursive(srcPath, destPath);
            }
        } else {
            // Copy HTML, CSS, JS, JSON, XML, TXT files
            if (/\.(html|css|js|json|xml|txt)$/.test(entry.name)) {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}

// Clean public directory
if (fs.existsSync('public')) {
    fs.rmSync('public', { recursive: true });
}

// Create public directory
fs.mkdirSync('public');

// Copy all necessary files to public
copyRecursive('.', 'public');

// Copy specific files
const filesToCopy = [
    'robots.txt',
    'sitemap.xml'
];

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join('public', file));
    }
});

console.log('✅ Files copied to public directory');