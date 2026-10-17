// Regenera los recursos optimizados de la demo (no es parte del sitio publicado).
//
//   npm i --no-save sharp@0.33.5
//   node scripts/build-assets.mjs <carpeta-con-jpg-originales>
//
// - Fotos de producto: JPG → WebP 480/960 px en site/img/products/
// - Iconos PWA/favicon: PNG 32/180/192/512 desde site/favicon.svg
import { readdir, mkdir } from "node:fs/promises";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const source = process.argv[2];

if (source) {
  const out = join(root, "img", "products");
  await mkdir(out, { recursive: true });
  for (const file of (await readdir(source)).filter((f) => /\.jpe?g$/i.test(f))) {
    const name = basename(file).replace(/\.jpe?g$/i, "");
    for (const width of [480, 960]) {
      await sharp(join(source, file))
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 74, effort: 6 })
        .toFile(join(out, `${name}-${width}.webp`));
    }
    console.log(`✓ ${name}`);
  }
}

const icons = [
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];
for (const [file, size] of icons) {
  await sharp(join(root, "favicon.svg"), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(join(root, file));
  console.log(`✓ ${file}`);
}
