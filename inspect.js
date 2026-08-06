const fs = require('fs');

const elements = JSON.parse(fs.readFileSync('bbc858890e9be5a2/pages/8ba0a05753f2a318/page_variants/a/elements.json', 'utf8'));

console.log('Total Elements:', elements.length);

const types = {};
const fonts = new Set();
const colors = new Set();
const bgImages = [];

elements.forEach(el => {
  types[el.type] = (types[el.type] || 0) + 1;
  
  if (el.style) {
    if (el.style.fontFamily) fonts.add(el.style.fontFamily);
    if (el.style.color) colors.add(el.style.color);
    if (el.style.background) {
      if (el.style.background.backgroundColor) colors.add(el.style.background.backgroundColor);
    }
  }

  if (el.content && el.content.asset) {
    bgImages.push({ id: el.id, name: el.name, file: el.content.asset.name, path: el.content.asset.unique_url });
  }

  if (el.type === 'lp-pom-block' || el.type === 'lp-pom-box' || el.type === 'lp-pom-button' || el.type === 'lp-pom-text') {
    console.log(`[${el.type}] ID: ${el.id} | Name: ${el.name || ''}`);
    if (el.geometry) console.log(`   Size: ${el.geometry.size?.width}x${el.geometry.size?.height} | Pos: ${el.geometry.offset?.left},${el.geometry.offset?.top}`);
    if (el.style) console.log(`   Style:`, JSON.stringify(el.style));
    if (el.content?.text) console.log(`   Text Snippet: ${el.content.text.replace(/<[^>]*>/g, '').slice(0, 120)}`);
  }
});

console.log('\n--- Summary ---');
console.log('Element types:', types);
console.log('Fonts found:', Array.from(fonts));
console.log('Colors found:', Array.from(colors));
console.log('Images found:', bgImages);
