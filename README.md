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

The multer middleware is designed to work with standard Node.js HTTP servers, where it expects the request object to be an instance of http.IncomingMessage. However, Azure Functions wraps the HTTP request object and exposes a simplified version, HttpRequest, which contains properties like query and params. This simplified request object does not include the raw stream that multer requires to parse multipart form-data (Refer https://stackoverflow.com/a/40717096/5544970).

Example of the simplified Azure Functions HttpRequest contents:
```js
HttpRequest {
  query: URLSearchParams {},
  params: {}
}
```
Because of this, multer cannot be directly used with Azure Functions. Alternative packages are also not likely to work. For insrance, the multiparty package uses the `.on` event which multiparty expects, but is absent as the Azure function doesn't include the raw stream. 

### Alternative: Parsing the multipart form-data manually

You can parse the multipart form-data manually. This involves reading the body of the request and parsing it yourself. While this can be more complex, it's necessary due to the limitations of the Azure Functions request object. This involves two main steps:

1. Accumulate Request Data: Collect the data chunks from the request into a buffer.
2. Parse the Buffer: Use a package like busboy to parse the buffered data manually.
