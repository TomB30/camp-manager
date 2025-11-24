import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

async function generateIcons() {
  console.log('Generating PWA icons...\n');
  
  const svgBuffer = readFileSync(join(process.cwd(), 'public', 'pwa-icon.svg'));
  
  for (const { size, name } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(process.cwd(), 'public', name));
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);

