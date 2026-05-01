const fs = require('fs');
const path = require('path');
const https = require('https');

const imageIds = [
  '1515562141207-7a88fb7ce338', // 1: Necklace
  '1630019058353-5240579b7631', // 2: Hoop
  '1605100804763-247f67b3557e', // 3: Diamond Ring
  '1573408301185-9146fe634ad0', // 4: Bangle
  '1611591437281-460bfbe1220a', // 5: Bracelet
  '1535632066927-ab7c9ab60908', // 6: Drop Earrings
  '1598560917505-59a3ad559071', // 7: Wedding Band
  '1590548364669-906d4e2d3b24', // 8: Studs
  '1611085583191-a3b181a88401', // 9: Choker
  '1602173574767-37ac01994b2a', // 10: Rose Gold Ring
  '1596944210900-34d125132274', // 11: Jhumkas
  '1576053139778-7e32f2ae3cfd', // 12: Anklet
  '1515562141207-7a88fb7ce338', // 13: Reuse
  '1630019058353-5240579b7631', // 14: Reuse
  '1605100804763-247f67b3557e'  // 15: Reuse
];

const dir = path.join(__dirname, 'client', 'public', 'products');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      const writeStream = fs.createWriteStream(filepath);
      res.pipe(writeStream);
      writeStream.on('finish', () => {
        writeStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log("Downloading real images...");
  for (let i = 0; i < imageIds.length; i++) {
    const url = `https://images.unsplash.com/photo-${imageIds[i]}?auto=format&fit=crop&q=80&w=800`;
    const filepath = path.join(dir, `${i + 1}.jpg`);
    try {
      await downloadImage(url, filepath);
      console.log(`Downloaded ${i + 1}.jpg`);
    } catch (err) {
      console.error(err.message);
    }
  }

  console.log("Updating seed.js...");
  const seedPath = path.join(__dirname, 'server', 'seed.js');
  let seedData = fs.readFileSync(seedPath, 'utf8');
  
  // Replace all image properties dynamically sequentially
  let count = 1;
  seedData = seedData.replace(/image:\s*'[^']+'/g, (match) => {
    const newImage = `image: '/products/${count}.jpg'`;
    count++;
    return newImage;
  });

  fs.writeFileSync(seedPath, seedData);
  console.log("Done! Seed data now uses local static images.");
}

main();
