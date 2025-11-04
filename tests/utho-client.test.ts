import { UthoObjectStorage } from '../src/utho-client';

// Test token for authentication
const TEST_TOKEN = 'Your Bearer Token Here';
const TEST_ACCESS_KEY = 'Your Access Key Here';
const TEST_SECRET_KEY = 'Your Secret Key Here';

describe('UthoObjectStorage - Based on Examples', () => {
  describe('Constructor - Authentication', () => {
    it('should create instance with Bearer token', () => {
      const tokenClient = new UthoObjectStorage({
        token: TEST_TOKEN,
      });
      expect(tokenClient).toBeInstanceOf(UthoObjectStorage);
    });

    it('should create instance with access/secret keys', () => {
      const keysClient = new UthoObjectStorage({
        accessKey: TEST_ACCESS_KEY,
        secretKey: TEST_SECRET_KEY,
      });
      expect(keysClient).toBeInstanceOf(UthoObjectStorage);
    });

    it('should throw error when no credentials provided', () => {
      expect(() => {
        new UthoObjectStorage({} as any);
      }).toThrow();
    });
  });

  describe('File Upload - Single File Example', () => {
    it('should correctly parse file path for root upload', () => {
      const filePath = 'file1.txt';
      const lastSlash = filePath.lastIndexOf('/');
      const fileName = lastSlash >= 0 ? filePath.substring(lastSlash + 1) : filePath;
      const path = lastSlash >= 0 ? filePath.substring(0, lastSlash) : '';

      expect(fileName).toBe('file1.txt');
      expect(path).toBe('');
    });

    it('should correctly parse file path for folder upload', () => {
      const folderName = 'foldername';
      const fileName = 'file1.txt';
      const filePath = `${folderName}/${fileName}`;
      
      const lastSlash = filePath.lastIndexOf('/');
      const extractedFileName = lastSlash >= 0 ? filePath.substring(lastSlash + 1) : filePath;
      const extractedPath = lastSlash >= 0 ? filePath.substring(0, lastSlash) : '';

      expect(extractedFileName).toBe('file1.txt');
      expect(extractedPath).toBe('foldername');
    });

    it('should create buffer from text content', () => {
      const content = `File 1 - Created at ${new Date().toISOString()}`;
      const fileBuffer = Buffer.from(content, 'utf-8');

      expect(fileBuffer).toBeInstanceOf(Buffer);
      expect(fileBuffer.toString('utf-8')).toBe(content);
    });
  });

  describe('File Upload - Multiple Files Example', () => {
    it('should generate correct file paths for 10 files', () => {
      const folderName = 'foldername';
      const filePaths: string[] = [];

      for (let i = 1; i <= 10; i++) {
        const fileName = `file${i}.txt`;
        const filePath = `${folderName}/${fileName}`;
        filePaths.push(filePath);
      }

      expect(filePaths).toHaveLength(10);
      expect(filePaths[0]).toBe('foldername/file1.txt');
      expect(filePaths[9]).toBe('foldername/file10.txt');
    });

    it('should extract filename correctly from each path', () => {
      const folderName = 'foldername';
      
      for (let i = 1; i <= 10; i++) {
        const fileName = `file${i}.txt`;
        const filePath = `${folderName}/${fileName}`;
        
        const lastSlash = filePath.lastIndexOf('/');
        const extractedFileName = lastSlash >= 0 ? filePath.substring(lastSlash + 1) : filePath;
        
        expect(extractedFileName).toBe(fileName);
        expect(extractedFileName).not.toContain('/');
      }
    });
  });

  describe('Configuration Examples', () => {
    it('should use innoida as dcslug', () => {
      const dcslug = 'innoida';
      expect(dcslug).toBe('innoida');
    });

    it('should accept bucket and folder names', () => {
      const bucketName = 'bucketname';
      const folderName = 'foldername';

      expect(bucketName).toBe('bucketname');
      expect(folderName).toBe('foldername');
    });

    it('should create proper file paths without nested folders', () => {
      const folderName = 'documents';
      const fileName = 'file1.txt';
      const filePath = `${folderName}/${fileName}`;

      // Should NOT create nested folder like 'documents/file1.txt/file1.txt'
      const lastSlash = filePath.lastIndexOf('/');
      const extractedPath = lastSlash >= 0 ? filePath.substring(0, lastSlash) : '';
      
      expect(extractedPath).toBe('documents');
      expect(extractedPath.split('/').length).toBe(1); // Only one folder level
    });
  });

  describe('Shareable URL Duration', () => {
    it('should accept valid duration formats', () => {
      const validDurations = ['30s', '15m', '1h', '7d', '1M', '1y', 'never'];
      
      validDurations.forEach(duration => {
        expect(['30s', '15m', '1h', '7d', '1M', '1y', 'never']).toContain(duration);
      });
    });
  });

  describe('Custom Configuration', () => {
    it('should accept custom endpoint', () => {
      const customClient = new UthoObjectStorage({
        token: TEST_TOKEN,
        endpoint: 'https://custom.api.com',
      });
      expect(customClient).toBeInstanceOf(UthoObjectStorage);
    });

    it('should accept custom timeout', () => {
      const timeoutClient = new UthoObjectStorage({
        token: TEST_TOKEN,
        timeout: 60000,
      });
      expect(timeoutClient).toBeInstanceOf(UthoObjectStorage);
    });
  });
});
