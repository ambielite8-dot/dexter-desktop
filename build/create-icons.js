const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const iconsDir = path.join(buildDir, 'icons');

function createPngIcon(size) {
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x08, 0x02, 0x00, 0x00, 0x00, 0xD3, 0x10, 0x3F,
    0x31, 0x00, 0x00, 0x00, 0x09, 0x70, 0x48, 0x59,
    0x73, 0x00, 0x00, 0x0E, 0xC3, 0x00, 0x00, 0x0E,
    0xC3, 0x01, 0xC7, 0x6F, 0xA8, 0x64, 0x00, 0x00,
    0x00, 0x19, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA,
    0xED, 0xC1, 0x01, 0x0D, 0x00, 0x00, 0x00, 0xC2,
    0xA0, 0xF7, 0x4F, 0x6D, 0x0E, 0x37, 0xA0, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xBE, 0x0D,
    0x21, 0x00, 0x00, 0x01, 0x9A, 0x60, 0xE1, 0xD5,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);

  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(size, 8);
  ihdr.writeUInt32BE(size, 12);
  ihdr[16] = 8;
  ihdr[17] = 2;
  ihdr[18] = 0;
  ihdr[19] = 0;
  ihdr[20] = 0;

  return Buffer.concat([header, ihdr]);
}

function createIcns(sizes) {
  const magic = Buffer.from('icns');
  const entries = [];

  sizes.forEach(size => {
    const iconSize = Math.min(128, size);
    const type = size >= 256 ? 'ic08' : size >= 128 ? 'ic07' : 'ic07';

    const entry = Buffer.alloc(8);
    entry.write(type, 0);
    entry.writeUInt32BE(8 + iconSize * iconSize * 3, 4);

    const data = Buffer.alloc(iconSize * iconSize * 3);
    for (let i = 0; i < data.length; i += 3) {
      data[i] = 99;
      data[i + 1] = 102;
      data[i + 2] = 241;
    }

    entries.push(Buffer.concat([entry, data]));
  });

  const totalSize = 8 + entries.reduce((sum, e) => sum + e.length, 0);
  const result = Buffer.alloc(totalSize);
  result.write('icns', 0);
  result.writeUInt32BE(totalSize, 4);

  let offset = 8;
  entries.forEach(e => {
    e.copy(result, offset);
    offset += e.length;
  });

  return result;
}

function createIco(sizes) {
  const images = sizes.map(size => {
    const bmp = Buffer.alloc(40 + size * size * 4);
    bmp.writeUInt32LE(40, 0);
    bmp.writeInt32LE(size, 4);
    bmp.writeInt32LE(size * 2, 8);
    bmp[12] = 1;
    bmp[14] = 32;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offset = 40 + (y * size + x) * 4;
        bmp[offset] = 241;
        bmp[offset + 1] = 102;
        bmp[offset + 2] = 99;
        bmp[offset + 3] = 255;
      }
    }
    return bmp;
  });

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = Buffer.alloc(16 * images.length);
  let dataOffset = 6 + 16 * images.length;

  images.forEach((img, i) => {
    const size = sizes[i];
    const entryOffset = i * 16;
    entries[entryOffset] = size >= 256 ? 0 : size;
    entries[entryOffset + 1] = size >= 256 ? 0 : size;
    entries[entryOffset + 2] = 0;
    entries[entryOffset + 3] = 0;
    entries[entryOffset + 4] = 0;
    entries.writeUInt8(0, entryOffset + 5);
    entries.writeUInt16LE(0, entryOffset + 6);
    entries.writeUInt16LE(0, entryOffset + 8);
    entries.writeUInt32LE(img.length, entryOffset + 12);
    entries.writeUInt32LE(dataOffset, entryOffset + 16 > 16 ? 0 : entryOffset + 16);
    dataOffset += img.length;
  });

  return Buffer.concat([header, entries, ...images]);
}

console.log('Creating icon assets...');

fs.writeFileSync(path.join(iconsDir, '16x16.png'), createPngIcon(16));
fs.writeFileSync(path.join(iconsDir, '32x32.png'), createPngIcon(32));
fs.writeFileSync(path.join(iconsDir, '48x48.png'), createPngIcon(48));
fs.writeFileSync(path.join(iconsDir, '64x64.png'), createPngIcon(64));
fs.writeFileSync(path.join(iconsDir, '128x128.png'), createPngIcon(128));
fs.writeFileSync(path.join(iconsDir, '256x256.png'), createPngIcon(256));
fs.writeFileSync(path.join(iconsDir, '512x512.png'), createPngIcon(512));
fs.writeFileSync(path.join(iconsDir, '1024x1024.png'), createPngIcon(1024));

fs.writeFileSync(path.join(buildDir, 'icon.icns'), createIcns([16, 32, 64, 128, 256, 512, 1024]));
fs.writeFileSync(path.join(buildDir, 'icon.ico'), createIco([16, 32, 48, 64, 128, 256, 512]));

console.log('Icon assets created successfully!');
console.log('Files:', fs.readdirSync(iconsDir));
