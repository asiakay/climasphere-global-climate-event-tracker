import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svgIcon = readFileSync(join(__dirname, '../public/icon.svg'));

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

async function generateIcons() {
  for (const { size, name } of sizes) {
    await sharp(svgIcon)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, '../public', name));
    console.log(`✓ Generated ${name}`);
  }
}

generateIcons().catch(console.error);
