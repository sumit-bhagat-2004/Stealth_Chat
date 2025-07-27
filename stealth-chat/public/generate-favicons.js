// Create a proper Flipkart-style favicon
const fs = require('fs');
const path = require('path');

// SVG favicon content with Flipkart colors
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="flipkartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2874F0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1B5BC6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" fill="url(#flipkartGradient)" rx="4"/>
  <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">F</text>
</svg>`;

// Apple touch icon (larger version)
const appleTouchIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <defs>
    <linearGradient id="flipkartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2874F0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1B5BC6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="180" height="180" fill="url(#flipkartGradient)" rx="20"/>
  <text x="90" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="white">F</text>
</svg>`;

// Write files
fs.writeFileSync(path.join(__dirname, 'favicon.svg'), faviconSVG);
fs.writeFileSync(path.join(__dirname, 'apple-touch-icon.svg'), appleTouchIcon);

console.log('✅ Favicon files generated successfully!');
console.log('Files created:');
console.log('- favicon.svg');
console.log('- apple-touch-icon.svg');
