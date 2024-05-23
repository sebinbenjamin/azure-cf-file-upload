const fs = require('fs');
const axios = require('axios');
const path = require('path');

const clearUploadsFolder = () => {
  const tempDir = os.tmpdir();
  const uploadDir = path.join(tempDir, 'vision-api');

  if (fs.existsSync(uploadDir)) {
    fs.readdirSync(uploadDir).forEach((file) => {
      const filePath = path.join(uploadDir, file);
      fs.unlinkSync(filePath);
    });
  }
};

const analyzeImage = async (imagePath) => {
  try {
    // Verify file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found: ${imagePath}`);
    }

    // Check file extension
    const ext = path.extname(imagePath).toLowerCase();
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff'];
    if (!supportedFormats.includes(ext)) {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    // Validate the file size before reading
    const stats = fs.statSync(imagePath);
    if (stats.size === 0) {
      console.log('Error : Image data length is 0');
      throw new Error('Image data length is 0');
    }

    // Read the image data
    const imageData = fs.readFileSync(imagePath);
    console.log('Image data length:', imageData.length);

    // Prepare the request configuration
    const config = {
      params: {
        visualFeatures: 'Tags',
      },
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': process.env.AZURE_COMPUTER_VISION_KEY,
      },
    };

    // Log the request configuration
    console.log('Azure Computer Vision API Endpoint:', process.env.AZURE_COMPUTER_VISION_ENDPOINT);
    console.log('Request headers:', config.headers);

    // Make the request to Azure Computer Vision API
    const response = await axios.post(`${process.env.AZURE_COMPUTER_VISION_ENDPOINT}/vision/v3.2/analyze`, imageData, config);

    // Log the response from the API
    console.log('API response data:', response.data);

    return response.data.tags;
  } catch (error) {
    // Log detailed error information
    // console.error('Error analyzing image:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

module.exports = {
  clearUploadsFolder,
  analyzeImage
};
