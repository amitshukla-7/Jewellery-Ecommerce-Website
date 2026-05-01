const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'client', 'public', 'products');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function downloadImage(url, filepath, redirects = 0) {
  if (redirects > 5) throw new Error('Too many redirects');
  
  return new Promise((resolve, reject) => {
    // Determine the protocol from the URL
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
  console.log("Downloading 15 UNIQUE real jewelry images...");
  for (let i = 1; i <= 15; i++) {
    // lock parameter ensures we get the same image for the same seed, but each i gives a different one
    const url = `https://loremflickr.com/800/800/jewelry,ring,necklace,diamond?lock=${i + 100}`;
    const filepath = path.join(dir, `${i}.jpg`);
    try {
      await downloadImage(url, filepath);
      console.log(`Downloaded ${i}.jpg successfully`);
    } catch (err) {
      console.error(`Failed on ${i}: ${err.message}`);
    }
  }
  console.log("Done! All 15 images have been replaced with unique photos.");
}

main();
