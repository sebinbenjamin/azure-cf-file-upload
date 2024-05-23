const os = require('os');
const path = require('path');
const fs = require('fs');
const busboy = require('busboy');
const { clearUploadsFolder, analyzeImage } = require('./helpers');

const carTypes = [
    'sedan', 'suv', 'coupe', 'convertible', 'hatchback', 'minivan', 'pickup truck',
    'truck', 'station wagon', 'sports car', 'van', 'luxury car'
];

const visionApiHandler = async (request, context) => {
    context.log('Processing request...');

    if (process.env.NODE_ENV === 'development') {
        clearUploadsFolder();
    }

    const contentType = request.headers.get('content-type');
    context.log('Content-Type:', contentType);

    if (!contentType) {
        context.log('Missing Content-Type header');
        return {
            status: 400,
            body: 'Missing Content-Type header'
        };
    }

    const chunks = [];
    for await (const chunk of request.body) {
        chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);
    context.log('Body buffer length:', bodyBuffer.length);

    return new Promise((resolve, reject) => {
        const bb = busboy({ headers: { 'content-type': contentType } });
        const tempDir = os.tmpdir();
        const uploadDir = path.join(tempDir, 'vision-api');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        let imagePath = null;

        bb.on('file', (fieldname, file, info) => {
            const { filename } = info;
            if (fieldname === 'image') {
                const saveTo = path.join(uploadDir, path.basename(filename));
                imagePath = saveTo;
                file.pipe(fs.createWriteStream(saveTo));
            }
        });

        bb.on('finish', async () => {
            if (!imagePath) {
                context.log('No file uploaded');
                return resolve({
                    status: 400,
                    body: 'No file uploaded'
                });
            }

            try {
                context.log(`File uploaded successfully: ${imagePath}`);
                const tags = await analyzeImage(imagePath);
                context.log("Tags received from Azure:", tags);

                const carType = tags.find(tag => carTypes.includes(tag.name));

                fs.unlinkSync(imagePath); // Clean up the temporary file

                return resolve({
                    status: 200,
                    jsonBody: { carType: carType ? carType.name : 'Unknown' }
                });
            } catch (error) {
                // context.log('Processing error:', error);
                return resolve({
                    status: 500,
                    body: 'An error occurred while processing the image.'
                });
            }
        });

        bb.on('error', (err) => {
            context.log('Upload error:', err);
            return reject({
                status: 500,
                body: 'An error occurred during file upload.'
            });
        });

        bb.end(bodyBuffer);
    });
};

module.exports = visionApiHandler;
