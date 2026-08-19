const fs = require('fs');
const path = require('path');

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/formatBengaliDate/g, 'formatEnglishDate');
  content = content.replace(/getDayNameBengali/g, 'getDayNameEnglish');
  // if 'toBengaliNumber' is imported but not used, we can leave it or remove it. It might just be an unused import now.
  fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      fixImports(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Fixed imports');
