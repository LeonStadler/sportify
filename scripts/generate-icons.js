import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "..", "public");
const svgPath = path.join(publicDir, "favicon.svg");

// Icon-Größen die generiert werden sollen
const iconSizes = {
  android: [
    { size: 192, name: "icon-192x192.png", maskable: false },
    { size: 192, name: "icon-192x192-maskable.png", maskable: true },
    { size: 512, name: "icon-512x512.png", maskable: false },
    { size: 512, name: "icon-512x512-maskable.png", maskable: true },
  ],
  ios: [
    // iOS nutzt 180x180 als Standard, skaliert automatisch für andere Geräte
    { size: 180, name: "apple-touch-icon-180x180.png" },
  ],
  favicon: [
    { size: 32, name: "favicon-32x32.png" },
    { size: 16, name: "favicon-16x16.png" },
  ],
};

/**
 * Erstellt ein maskable Icon (mit Safe Zone)
 * Safe Zone ist 80% des Icons, also 20% Padding
 */
async function createMaskableIcon(inputSvg, size, outputPath) {
  const safeZoneSize = Math.floor(size * 0.8);
  const padding = Math.floor((size - safeZoneSize) / 2);

  // Erstelle ein weißes Hintergrundbild
  const background = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  });

  // Lade SVG und skaliere auf Safe Zone Größe
  const icon = sharp(Buffer.from(inputSvg)).resize(safeZoneSize, safeZoneSize, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  // Kombiniere Hintergrund und Icon mit Padding
  const iconBuffer = await icon.png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      {
        input: iconBuffer,
        left: padding,
        top: padding,
      },
    ])
    .png()
    .toFile(outputPath);
}

/**
 * Erstellt ein normales Icon
 */
async function createIcon(inputSvg, size, outputPath) {
  await sharp(Buffer.from(inputSvg))
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);
}

async function generateIcons() {
  console.log("🎨 Starte Icon-Generierung...\n");

  // Prüfe ob SVG existiert
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ SVG-Datei nicht gefunden: ${svgPath}`);
    process.exit(1);
  }

  // Lade SVG
  const svgBuffer = fs.readFileSync(svgPath);
  const svgString = svgBuffer.toString();

  let totalGenerated = 0;

  // Generiere Android Icons
  console.log("📱 Generiere Android Icons...");
  for (const icon of iconSizes.android) {
    const outputPath = path.join(publicDir, icon.name);
    try {
      if (icon.maskable) {
        await createMaskableIcon(svgString, icon.size, outputPath);
      } else {
        await createIcon(svgString, icon.size, outputPath);
      }
      console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size})`);
      totalGenerated++;
    } catch (error) {
      console.error(`  ❌ Fehler bei ${icon.name}:`, error.message);
    }
  }

  // Generiere iOS Icons
  console.log("\n🍎 Generiere iOS Icons...");
  for (const icon of iconSizes.ios) {
    const outputPath = path.join(publicDir, icon.name);
    try {
      await createIcon(svgString, icon.size, outputPath);
      console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size})`);
      totalGenerated++;
    } catch (error) {
      console.error(`  ❌ Fehler bei ${icon.name}:`, error.message);
    }
  }

  // Generiere Favicon Icons
  console.log("\n🔖 Generiere Favicon Icons...");
  for (const icon of iconSizes.favicon) {
    const outputPath = path.join(publicDir, icon.name);
    try {
      await createIcon(svgString, icon.size, outputPath);
      console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size})`);
      totalGenerated++;
    } catch (error) {
      console.error(`  ❌ Fehler bei ${icon.name}:`, error.message);
    }
  }

  console.log(`\n✨ Fertig! ${totalGenerated} Icons generiert.`);
  console.log("\n📝 Nächste Schritte:");
  console.log(
    "  1. Aktualisiere public/site.webmanifest mit den neuen PNG-Icons"
  );
  console.log("  2. Aktualisiere index.html mit den Apple Touch Icons");
}

generateIcons().catch((error) => {
  console.error("❌ Fehler beim Generieren der Icons:", error);
  process.exit(1);
});
