import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import {
    UthoConfig,
    ObjectStorage,
    ObjectInfo,
    UthoError,
    AccessKey,
    ObjectStoragePlan,
    CreateObjectStorageRequest,
    CreateAccessKeyRequest,
    ModifyAccessKeyRequest,
    CreateDirectoryRequest,
    ShareableDuration
} from './types.js';

/**
 * Utho Object Storage Client
 * 
 * A comprehensive client for interacting with Utho.com Object Storage services.
 * This client follows the actual Utho REST API specification.
 */
export class UthoObjectStorage {
    private readonly config: Required<UthoConfig>;
    private readonly httpClient: AxiosInstance;

    /**
     * Create a new Utho Object Storage client
     * @param config - Configuration options with Bearer token or access key/secret key
     */
    constructor(config: UthoConfig) {
        // Validate authentication
        if (!config.token && (!config.accessKey || !config.secretKey)) {
            throw new Error('Authentication required. Please provide either:\n' +
                '1. Bearer token: { token: "your-bearer-token" }\n' +
                '2. Access keys: { accessKey: "your-access-key", secretKey: "your-secret-key" }');
        }

        // Set sensible defaults
        this.config = {
            endpoint: config.endpoint || 'https://api.utho.com/v2',
            timeout: config.timeout || 30000,
            token: config.token,
            accessKey: config.accessKey,
            secretKey: config.secretKey
        } as Required<UthoConfig>;

        // Warn if custom endpoint is used
        if (config.endpoint && config.endpoint !== 'https://api.utho.com/v2') {
            console.warn('⚠️  Using custom endpoint:', config.endpoint);
            console.warn('💡 This should only be used for testing or custom deployments');
        }

        // Determine authentication headers
        let authHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': '@utho/object-storage/1.0.0'
        };

        if (this.config.token) {
            // Bearer token authentication
            authHeaders['Authorization'] = `Bearer ${this.config.token}`;
        } else if (this.config.accessKey && this.config.secretKey) {
            // Access key authentication
            authHeaders['X-Access-Key'] = this.config.accessKey;
            authHeaders['X-Secret-Key'] = this.config.secretKey;
        }

        this.httpClient = axios.create({
            baseURL: this.config.endpoint,
            timeout: this.config.timeout,
            headers: authHeaders
        });

        // Add response interceptor for error handling
        this.httpClient.interceptors.response.use(
            (response: any) => response,
            (error: any) => {
                throw this.handleError(error);
            }
        );
    }

    /**
     * Get current client configuration (without exposing sensitive credentials)
     * @returns Configuration information
     */
    getConfiguration(): { 
        endpoint: string; 
        timeout: number; 
        authType: 'bearer' | 'accesskey'; 
        hasAuth: boolean 
    } {
        return {
            endpoint: this.config.endpoint,
            timeout: this.config.timeout,
            authType: this.config.token ? 'bearer' : 'accesskey',
            hasAuth: !!(this.config.token || (this.config.accessKey && this.config.secretKey))
        };
    }

    // ==================== OBJECT STORAGE MANAGEMENT ====================

    /**
     * Get list of Object Storage buckets
     * @param dcslug - Data center slug (e.g., 'innoida')
     * @returns Array of Object Storage buckets
     */
    async listObjectStorages(dcslug: string): Promise<ObjectStorage[]> {
        const response = await this.httpClient.get(`/objectstorage/${dcslug}/bucket/`);
        return response.data.data || response.data;
    }

    /**
     * Create a new Object Storage bucket
     * @param request - Object Storage creation request
     * @returns Created Object Storage information
     */
    async createObjectStorage(request: CreateObjectStorageRequest): Promise<ObjectStorage> {
        const response = await this.httpClient.post('/objectstorage/bucket/create/', request);
        return response.data.data || response.data;
    }

    /**
     * Get Object Storage bucket details
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @returns Object Storage details
     */
    async getObjectStorageDetails(dcslug: string, name: string): Promise<ObjectStorage> {
        const response = await this.httpClient.get(`/objectstorage/${dcslug}/bucket/${name}/`);
        return response.data.data || response.data;
    }

    /**
     * Delete Object Storage bucket
     * @param dcslug - Data center slug
     * @param name - Bucket name
     */
    async deleteObjectStorage(dcslug: string, name: string): Promise<void> {
        await this.httpClient.delete(`/objectstorage/${dcslug}/bucket/${name}/delete/`);
    }

    /**
     * Get Object Storage plan list
     * @returns Array of available plans
     */
    async getObjectStoragePlans(): Promise<ObjectStoragePlan[]> {
        const response = await this.httpClient.get('/pricing/objectstorage/');
        return response.data.data || response.data;
    }

    // ==================== ACCESS KEY MANAGEMENT ====================

    /**
     * Get list of access keys for Object Storage
     * @param dcslug - Data center slug
     * @returns Array of access keys
     */
    async listAccessKeys(dcslug: string): Promise<AccessKey[]> {
        const response = await this.httpClient.get(`/objectstorage/${dcslug}/accesskeys`);
        return response.data.data || response.data;
    }

    /**
     * Create a new access key
     * @param dcslug - Data center slug
     * @param request - Access key creation request
     * @returns Created access key information
     */
    async createAccessKey(dcslug: string, request: CreateAccessKeyRequest): Promise<AccessKey> {
        const response = await this.httpClient.post(`/objectstorage/${dcslug}/accesskey/create`, request);
        return response.data.data || response.data;
    }

    /**
     * Modify access key status
     * @param dcslug - Data center slug
     * @param name - Access key name
     * @param request - Modification request
     */
    async modifyAccessKey(dcslug: string, name: string, request: ModifyAccessKeyRequest): Promise<void> {
        await this.httpClient.post(`/objectstorage/${dcslug}/accesskey/${name}/status`, request);
    }

    // ==================== BUCKET POLICY & PERMISSIONS ====================

    /**
     * Update access policy of Object Storage bucket
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param policy - Policy type (public, private, upload)
     */
    async updateAccessPolicy(dcslug: string, name: string, policy: string): Promise<void> {
        await this.httpClient.post(`/objectstorage/${dcslug}/bucket/${name}/policy/${policy}/`, {
            policy
        });
    }

    /**
     * Update permission of Object Storage bucket for specific access key
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param permission - Permission level
     * @param accessKey - Access key
     */
    async updatePermission(
        dcslug: string,
        name: string,
        permission: string,
        accessKey: string
    ): Promise<void> {
        await this.httpClient.post(
            `/objectstorage/${dcslug}/bucket/${name}/permission/${permission}/accesskey/${accessKey}`,
            {
                selected_permission: permission,
                selected_key: accessKey
            }
        );
    }

    // ==================== FILE & DIRECTORY OPERATIONS ====================

    /**
     * Get list of files and directories in Object Storage bucket
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @returns Array of objects (files and directories)
     */
    async listObjects(dcslug: string, name: string): Promise<ObjectInfo[]> {
        const response = await this.httpClient.get(`/objectstorage/${dcslug}/bucket/${name}/objects/`);
        
        // Handle different response formats
        if (response.data.objects) {
            return response.data.objects;
        }
        return response.data.data || response.data;
    }

    /**
     * Create a directory in Object Storage bucket
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param request - Directory creation request
     */
    async createDirectory(dcslug: string, name: string, request: CreateDirectoryRequest): Promise<void> {
        await this.httpClient.post(`/objectstorage/${dcslug}/bucket/${name}/createdirectory/`, request);
    }

    /**
     * Upload file to Object Storage bucket
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param file - File to upload (File object or Buffer)
     * @param path - File path in bucket (can include directories, e.g., 'folder/file.txt' or just 'file.txt')
     */
    async uploadFile(dcslug: string, name: string, file: File | Buffer, path: string): Promise<void> {
        const formData = new FormData();
        
        // Extract filename and directory from path
        const pathParts = path.split('/');
        const filename = pathParts.pop() || 'file';
        const directoryPath = pathParts.join('/');
        
        // Handle different file types properly for Node.js
        if (file instanceof Buffer) {
            // For Buffer, we need to provide filename and content type
            formData.append('file', file, {
                filename: filename,
                contentType: 'application/octet-stream'
            });
        } else {
            // For File objects
            formData.append('file', file);
        }
        
        // IMPORTANT: The 'path' field should contain ONLY the directory path (without filename)
        // For root level files, don't include the path field at all
        if (directoryPath) {
            formData.append('path', directoryPath);
        }

        // Get the auth headers from the client
        const authHeaders: Record<string, string> = {};
        if (this.config.token) {
            authHeaders['Authorization'] = `Bearer ${this.config.token}`;
        } else if (this.config.accessKey && this.config.secretKey) {
            authHeaders['X-Access-Key'] = this.config.accessKey;
            authHeaders['X-Secret-Key'] = this.config.secretKey;
        }

        await this.httpClient.post(`/objectstorage/${dcslug}/bucket/${name}/upload/`, formData, {
            headers: {
                // Start with auth headers
                ...authHeaders,
                // Add form-data headers (this will override Content-Type)
                ...formData.getHeaders()
            }
        });
    }

    /**
     * Get sharable URL for Object Storage file
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param filename - File name
     * @param expiryTime - Expiry time (e.g., '30s', '15m', '1h', '7d', '1M', '1y', 'never')
     * @returns Sharable URL
     */
    async getSharableUrl(
        dcslug: string,
        name: string,
        filename: string,
        expiryTime: ShareableDuration
    ): Promise<string> {
        // Handle 'never' case - use maximum allowed duration (1 year)
        const actualExpiry = expiryTime === 'never' ? '1y' : expiryTime;
        
        const response = await this.httpClient.get(
            `/objectstorage/${dcslug}/bucket/${name}/download?path=${filename}&expire=${actualExpiry}`
        );
        
        // Handle different response formats
        if (typeof response.data === 'string') {
            return response.data;
        } else if (response.data.url) {
            return response.data.url;
        } else if (response.data.download_url) {
            return response.data.download_url;
        } else {
            // Fallback: return JSON string representation
            return JSON.stringify(response.data);
        }
    }

    /**
     * Delete file from Object Storage bucket
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param filename - File name to delete
     */
    async deleteFile(dcslug: string, name: string, filename: string): Promise<void> {
        await this.httpClient.delete(
            `/objectstorage/${dcslug}/bucket/${name}/delete/object?path=${filename}/`
        );
    }

    /**
     * Delete directory from Object Storage bucket
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param directoryName - Directory name to delete
     */
    async deleteDirectory(dcslug: string, name: string, directoryName: string): Promise<void> {
        await this.httpClient.delete(
            `/objectstorage/${dcslug}/bucket/${name}/delete/object?path=${directoryName}`
        );
    }

    // ==================== CONVENIENCE METHODS ====================

    /**
     * Check if Object Storage bucket exists
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @returns True if bucket exists, false otherwise
     */
    async bucketExists(dcslug: string, name: string): Promise<boolean> {
        try {
            await this.getObjectStorageDetails(dcslug, name);
            return true;
        } catch (error: any) {
            if (error.statusCode === 404) {
                return false;
            }
            throw error;
        }
    }

    /**
     * Upload file with automatic form data handling
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param filename - Name for the file
     * @param content - File content (string, Buffer, or File)
     * @param path - Optional path prefix
     */
    async putObject(
        dcslug: string,
        name: string,
        filename: string,
        content: string | Buffer | File,
        path: string = ''
    ): Promise<void> {
        const filePath = path ? `${path}/${filename}` : filename;

        let fileToUpload: File | Buffer;

        if (typeof content === 'string') {
            fileToUpload = Buffer.from(content, 'utf8');
        } else {
            fileToUpload = content;
        }

        await this.uploadFile(dcslug, name, fileToUpload, filePath);
    }

    /**
     * Download file content (get sharable URL and fetch)
     * @param dcslug - Data center slug
     * @param name - Bucket name
     * @param filename - File name
     * @param expiryTime - URL expiry time (default: 1 hour)
     * @returns File URL (you need to fetch the content separately)
     */
    async getObject(
        dcslug: string,
        name: string,
        filename: string,
        expiryTime: ShareableDuration = '1h'
    ): Promise<string> {
        return await this.getSharableUrl(dcslug, name, filename, expiryTime);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private handleError(error: any): UthoError {
        const uthoError: UthoError = {
            code: error.response?.data?.code || error.code || 'UnknownError',
            message: error.response?.data?.message || error.message || 'An unknown error occurred',
            statusCode: error.response?.status || 500,
            requestId: error.response?.headers?.['x-request-id']
        };

        return uthoError;
    }
}