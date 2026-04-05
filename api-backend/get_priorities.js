const fs = require('fs');
const lines = fs.readFileSync('index.js', 'utf8').split('\n');
lines.forEach(l => {
  if (l.includes('name:') || l.includes('priority:')) {
    if (l.trim().startsWith('name:') || l.trim().startsWith('priority:')) {
      console.log(l.trim());
    }
  }
});
