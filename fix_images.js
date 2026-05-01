const fs = require('fs');
const path = require('path');
const https = require('https');

const imageIds = [
  '1515562141207-7a88fb7ce338', // 1
  '1605100804763-247f67b3557e', // 2
  '1573408301185-9146fe634ad0', // 3
  '1611591437281-460bfbe1220a', // 4
  '1535632066927-ab7c9ab60908', // 5
  '1598560917505-59a3ad559071', // 6
  '1543294001-f7cd5d7fb516', // 7 (New)
  '1611085583191-a3b181a88401', // 8
  '1602173574767-37ac01994b2a', // 9
  '1599643478518-a784e5dc4c8f', // 10 (New)
  '1576053139778-7e32f2ae3cfd', // 11
  '1601121141461-9d6647bca1ed', // 12
  '1617038220319-276d3cfab638', // 13
  '1635767798638-3e25273a8236', // 14
  '1589128777073-263566ae5e4d'  // 15 (New)
];

const dir = path.join(__dirname, 'client', 'public', 'products');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function downloadImage(url, filepath, redirects = 0) {
  if (redirects > 5) throw new Error('Too many redirects');
  
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : require('http');
    
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        let location = res.headers.location;
        if (location.startsWith('/')) {
            const parsedUrl = new URL(url);
            location = `${parsedUrl.protocol}//${parsedUrl.host}${location}`;
        }
        return downloadImage(location, filepath, redirects + 1).then(resolve).catch(reject);
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
  console.log("Downloading 15 UNIQUE high-quality jewelry images...");
  for (let i = 0; i < imageIds.length; i++) {
    const url = `https://images.unsplash.com/photo-${imageIds[i]}?auto=format&fit=crop&q=80&w=800`;
    const filepath = path.join(dir, `${i + 1}.jpg`);
    try {
      await downloadImage(url, filepath);
      console.log(`Downloaded ${i + 1}.jpg successfully`);
    } catch (err) {
      console.error(`Failed on ${i + 1}: ${err.message}`);
    }
  }
  
  console.log("Updating seed.js...");
  const seedPath = path.join(__dirname, 'server', 'seed.js');
  let seedData = fs.readFileSync(seedPath, 'utf8');
  
  let count = 1;
  seedData = seedData.replace(/image:\s*'[^']+'/g, (match) => {
    const newImage = `image: '/products/${count}.jpg'`;
    count++;
    return newImage;
  });

  fs.writeFileSync(seedPath, seedData);
  console.log("Done! Seed data now uses local high-quality jewelry images.");
}

main();
