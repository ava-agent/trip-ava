
const fs = require('fs');
const https = require('https');
const path = require('path');

const destinations = [
    { name: 'dali_ancient_city.jpg', url: 'https://placehold.co/800x600/e2e8f0/475569.jpg?text=Dali+Ancient+City' },
    { name: 'lijiang_ancient_city.jpg', url: 'https://placehold.co/800x600/e2e8f0/475569.jpg?text=Lijiang+Ancient+City' },
    { name: 'shangri_la.jpg', url: 'https://placehold.co/800x600/e2e8f0/475569.jpg?text=Shangri-La' },
    { name: 'erhai_lake.jpg', url: 'https://placehold.co/800x600/e2e8f0/475569.jpg?text=Erhai+Lake' }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            const stream = fs.createWriteStream(filepath);
            res.pipe(stream);
            stream.on('finish', () => {
                stream.close();
                console.log(`Downloaded ${filepath}`);
                resolve();
            });
            stream.on('error', reject);
        }).on('error', reject);
    });
};

const main = async () => {
    const dir = path.join(__dirname, 'public', 'images', 'destinations');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    for (const dest of destinations) {
        try {
            await downloadImage(dest.url, path.join(dir, dest.name));
        } catch (e) {
            console.error(`Failed to download ${dest.name}:`, e);
        }
    }
};

main();
