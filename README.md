# Utho Object Storage SDK

A simple and powerful Node.js SDK for Utho.com Object Storage services. Upload, download, and manage your files in the cloud with just a few lines of code.

[![npm version](https://badge.fury.io/js/@utho-community%2Fobject-storage.svg)](https://badge.fury.io/js/@utho-community%2Fobject-storage)

## Features

- ✅ **Simple Setup**: Just provide your token and start uploading
- ✅ **File Upload**: Upload single or multiple files with folder support
- ✅ **TypeScript Support**: Full type definitions included
- ✅ **Bucket Management**: Create, list, and manage buckets
- ✅ **Folder Support**: Organize files in folders (fixed!)
- ✅ **Dual Authentication**: Bearer token or Access/Secret keys

## Installation

```bash
npm install @utho-community/object-storage
```

## Quick Start

```typescript
import { UthoObjectStorage } from '@utho-community/object-storage';

// Create client with Bearer token
const client = new UthoObjectStorage({
  token: 'your-bearer-token' // Get from Utho dashboard
});

// Upload a file
const fileContent = Buffer.from('Hello, World!', 'utf-8');
await client.uploadFile('innoida', 'my-bucket', fileContent, 'hello.txt');

// Upload file to a folder
await client.uploadFile('innoida', 'my-bucket', fileContent, 'documents/hello.txt');
```

## Examples

### Single File Upload

```typescript
import { UthoObjectStorage } from '@utho-community/object-storage';

const client = new UthoObjectStorage({
  token: 'your-bearer-token'
});

const dcslug = 'innoida';
const bucketName = 'my-bucket';

// Example 1: Upload to bucket root
const content1 = Buffer.from('Hello World', 'utf-8');
await client.uploadFile(dcslug, bucketName, content1, 'test-file.txt');

// Example 2: Upload to a folder
const content2 = Buffer.from('Document content', 'utf-8');
await client.uploadFile(dcslug, bucketName, content2, 'documents/my-doc.txt');

// Example 3: Upload actual file from disk
import * as fs from 'fs';
const fileContent = fs.readFileSync('./README.md');
await client.uploadFile(dcslug, bucketName, fileContent, 'files/README.md');
```

### Multiple Files Upload

```typescript
import { UthoObjectStorage } from '@utho-community/object-storage';

const client = new UthoObjectStorage({
  token: 'your-bearer-token'
});

const dcslug = 'innoida';
const bucketName = 'my-bucket';
const folderName = 'documents';

// Upload 10 files to a folder
for (let i = 1; i <= 10; i++) {
  const fileName = `file${i}.txt`;
  const content = `File ${i} - Created at ${new Date().toISOString()}`;
  const fileBuffer = Buffer.from(content, 'utf-8');
  const filePath = `${folderName}/${fileName}`;
  
  try {
    await client.uploadFile(dcslug, bucketName, fileBuffer, filePath);
    console.log(`✅ Uploaded: ${fileName}`);
  } catch (error) {
    console.error(`❌ Failed: ${fileName}`, error.message);
  }
}
```

See the [examples folder](./examples/) for complete working examples:
- `single-file-upload.ts` - Single file upload examples
- `multi-file-upload.ts` - Multiple files upload example

## API Reference

### Upload Methods

```typescript
// uploadFile() - Upload a file with full path (recommended)
await client.uploadFile(
  dcslug,       // Data center slug (e.g., 'innoida')
  bucketName,   // Bucket name
  fileBuffer,   // File content as Buffer
  'folder/file.txt'  // Full path: folder + filename
);

// putObject() - Alternative upload method
await client.putObject(
  dcslug,       // Data center slug (e.g., 'innoida')
  bucketName,   // Bucket name
  'file.txt',   // Filename
  content       // Content as string or Buffer
);
```

### Bucket Management

```typescript
// Create a new bucket
await client.createObjectStorage({
  dcslug: 'innoida',
  name: 'my-bucket',
  size: '10',          // Size in GB
  billing: 'Monthly'
});

// List all buckets
const buckets = await client.listObjectStorages('innoida');

// Get bucket details
const details = await client.getObjectStorageDetails('innoida', 'my-bucket');

// Delete bucket
await client.deleteObjectStorage('innoida', 'my-bucket');

// Check if bucket exists
const exists = await client.bucketExists('innoida', 'my-bucket');
```

### File Operations

```typescript
// Delete a file
await client.deleteFile('innoida', 'my-bucket', 'documents/old-file.txt');

// Delete a directory
await client.deleteDirectory('innoida', 'my-bucket', 'old-folder');

// Create a directory
await client.createDirectory('innoida', 'my-bucket', { path: 'new-folder' });

// Get shareable URL (1 hour expiry)
const url = await client.getSharableUrl('innoida', 'my-bucket', 'file.txt', '1h');

// Duration options: '30s', '15m', '1h', '7d', '1M', '1y', 'never'
const permanentUrl = await client.getSharableUrl('innoida', 'my-bucket', 'file.txt', 'never');
```

### Access Key Management

```typescript
// List access keys
const keys = await client.listAccessKeys('innoida');

// Create access key
await client.createAccessKey('innoida', { accesskey: 'my-access-key' });

// Modify access key status
await client.modifyAccessKey('innoida', 'key-name', { 
  accesskey: 'key-value',
  status: 'enable' // or 'disable', 'remove'
});
```

## Authentication

### Bearer Token (Recommended)
```typescript
const client = new UthoObjectStorage({
  token: 'your-bearer-token'  // Get from Utho Dashboard → API
});
```

### Access Key + Secret Key
```typescript
const client = new UthoObjectStorage({
  accessKey: 'your-access-key',     // From Object Storage settings
  secretKey: 'your-secret-key'      // From Object Storage settings
});
```

### Getting Credentials

**Bearer Token:**
1. Login to [Utho Dashboard](https://console.utho.com)
2. Go to **API** section
3. Generate new Bearer token

**Access Keys:**
1. Login to [Utho Dashboard](https://console.utho.com)
2. Go to **Object Storage** → Select your bucket
3. View or create access keys

## Configuration Options

```typescript
const client = new UthoObjectStorage({
  token: 'your-token',
  timeout: 60000,  // Optional: Request timeout in ms (default: 30000)
  endpoint: 'https://api.utho.com/v2'  // Optional: Custom API endpoint
});
```

## Error Handling

```typescript
try {
  await client.uploadFile('innoida', 'my-bucket', fileBuffer, 'documents/file.pdf');
  console.log('✅ Upload successful!');
} catch (error) {
  console.error('❌ Upload failed:', error.message);
  // Handle specific errors
  if (error.statusCode === 404) {
    console.error('Bucket not found');
  }
}
```

## Important Notes

### File Paths
- ✅ **Correct**: `'folder/file.txt'` - File goes to folder
- ✅ **Correct**: `'file.txt'` - File goes to root
- ✅ **Correct**: `'docs/2024/report.pdf'` - Nested folders

### Known API Limitations
- The `listObjects()` API may return empty results (Utho API limitation)
- Files are uploaded successfully even if list returns empty
- Verify uploads via Utho web console

## Working Examples

Check the [examples folder](./examples/) for complete working code:

- **single-file-upload.ts** - Single file upload with different scenarios
- **multi-file-upload.ts** - Upload 10 files to a folder

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { 
  UthoObjectStorage, 
  UthoConfig, 
  ObjectStorage,
  AccessKey,
  ObjectInfo,
  ShareableDuration
} from '@utho-community/object-storage';

// Type-safe configuration
const config: UthoConfig = {
  token: 'your-token',
  timeout: 30000
};

const client = new UthoObjectStorage(config);
```

## Requirements

- Node.js >= 14.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)

## Package Info

- **Dual Module Support**: ESM and CommonJS
- **TypeScript Declarations**: Full type definitions included
- **Dependencies**: axios, form-data
- **Size**: ~20KB (minified)

## Support & Links

- 📖 [Examples](./examples/) - Working code examples
- 📚 [API Documentation](https://console.utho.com/docs)
- 🐛 [Report Issues](https://github.com/utho-community/object-storage/issues)
- 💬 [Support](https://utho.com)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

The original author of Utho Object Storage SDK is [Anwaarul Haque](https://github.com/anwaarulhaque)

## Contributors

This project is maintained by the Utho Community.


---

**Made with ❤️ for Utho.com developers**
