const fs = require('fs');
const path = require('path');
const dict = JSON.parse(fs.readFileSync('dict.json', 'utf8'));

function applyTo(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const regex = /["'>]([^"'<>]*[\u0980-\u09FF][^"'<>]*)["'<]/g;
  content = content.replace(regex, (match, p1) => {
    const trimmed = p1.trim();
    if (dict[trimmed] && dict[trimmed] !== trimmed) {
      changed = true;
      return match.replace(trimmed, dict[trimmed]);
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      applyTo(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Applied dict');
