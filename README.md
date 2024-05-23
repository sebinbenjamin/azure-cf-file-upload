# Azure Function for Vision API with File Upload

This project demonstrates an Azure Function that handles file uploads and processes images using the Azure Computer Vision API. The function parses multipart form-data and analyzes the uploaded images to identify car types.

## Prerequisites

- Node.js (LTS version recommended)
- Azure Functions Core Tools
- An Azure account with an active subscription
- Azure Computer Vision API endpoint and key

## Installation

1. **Clone the repository**:
```sh
git clone https://github.com/
cd azure-vision-api
```

2. **Install dependencies**:

```sh
npm install
````

3. **Setup environment variables**:

Create a `.env` file in the root of the project and add your Azure Computer Vision API endpoint and key:

```sh
AZURE_COMPUTER_VISION_ENDPOINT=https://<your-endpoint>.cognitiveservices.azure.com/
AZURE_COMPUTER_VISION_KEY=<your-computer-vision-key>
NODE_ENV=development
```

## Folder Structure
```
─ .funcignore
─ .gitignore
─ host.json
─ local.settings.json
─ package-lock.json
─ package.json
─ README.md
─ src
  └── functions
      ├── helpers.js
      ├── index.js
      └── visionAPIHandler.js
```

## Usage
### Running Locally

1. Start the Azure Function:

```sh
  func start
```

2. Test the function
- Use Postman to easily test the file upload.
  - Make sure you've selected `form-data` in the `Body` and have added the key as `image` of type `File` and value as the image to be uploaded.

## Troubleshooting

### Why do some node/express libraries not work out in cloud function?

Many Node.js/Express libraries like `multer` are designed to work with standard Node.js HTTP servers, where they expect the request object to be an instance of `http.IncomingMessageHowever`. However, cloud functions such as Azure Functions wrap the HTTP request object and expose a simplified version, often referred to as HttpRequest. This object includes properties like query and params but does not include the raw stream that certain libraries, such as multer, require to parse multipart form-data. (Refer https://stackoverflow.com/a/40717096/5544970).

Because of this, multer and similar middleware cannot be directly used with Azure Functions. For instance, the multiparty package relies on the .on event which expects the raw stream, but this stream is not provided by Azure Functions.

### Alternative: Parsing the multipart form-data manually

To handle multipart form-data in cloud functions, you can manually parse the data. This involves reading the body of the request and parsing it yourself. While more complex, this method accommodates the limitations of the cloud function's request object. The process involves two main steps:

1. Accumulate Request Data: Collect the data chunks from the request into a buffer.
2. Parse the Buffer: Use a package like busboy to parse the buffered data manually.

By manually handling the request data and parsing it, you can work around the limitations imposed by cloud functions and effectively manage multipart form-data uploads.
