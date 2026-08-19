const fs = require('fs');
const path = require('path');

const results = {};

function extractFrom(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match any string literal that contains bengali characters
  const regex = /["'>]([^"'<>]*[\u0980-\u09FF][^"'<>]*)["'<]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text) {
      results[text] = text;
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      extractFrom(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
fs.writeFileSync('bengali2.json', JSON.stringify(Object.keys(results), null, 2));
