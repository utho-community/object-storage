/**
 * Configuration options for the Utho Object Storage client
 */
export interface UthoConfig {
    /** Bearer token for authentication (option 1) */
    token?: string;
    /** Access key for authentication (option 2 - use with secretKey) */
    accessKey?: string;
    /** Secret key for authentication (option 2 - use with accessKey) */
    secretKey?: string;
    /** Request timeout in milliseconds (optional - defaults to 30000ms) */
    timeout?: number;
    /** 
     * API endpoint URL (advanced use only - defaults to https://api.utho.com/v2)
     * Only specify this for testing environments or custom deployments
     * @internal
     */
    endpoint?: string;
}

/**
 * Object Storage bucket information
 */
export interface ObjectStorage {
    /** Bucket name */
    name: string;
    /** Data center slug */
    dcslug: string;
    /** Plan ID */
    planid: string;
    /** Size */
    size: string;
    /** Billing cycle */
    billing: string;
    /** Status */
    status: string;
    /** Creation date */
    created_at: string;
}

/**
 * Access Key information
 */
export interface AccessKey {
    /** Access key name */
    name: string;
    /** Access key value */
    key: string;
    /** Secret key */
    secret: string;
    /** Status */
    status: string;
    /** Created date */
    created_at: string;
}

/**
 * Object Storage Plan
 */
export interface ObjectStoragePlan {
    /** Plan ID */
    id: string;
    /** Plan name */
    name: string;
    /** Storage size */
    storage: string;
    /** Price */
    price: number;
}

/**
 * Object/File information
 */
export interface ObjectInfo {
    /** Object name/path */
    name: string;
    /** Object type (file or directory) */
    type: 'file' | 'directory';
    /** File size in bytes */
    size?: number;
    /** Last modified date */
    modified?: string;
    /** File path */
    path: string;
}

/**
 * Request to create Object Storage
 */
export interface CreateObjectStorageRequest {
    /** Data center slug */
    dcslug: string;
    /** Billing cycle */
    billing: string;
    /** Plan ID */
    size: string;
    /** Bucket name */
    name: string;
}

/**
 * Request to create Access Key
 */
export interface CreateAccessKeyRequest {
    /** Access key name */
    accesskey: string;
}

/**
 * Request to modify Access Key
 */
export interface ModifyAccessKeyRequest {
    /** Access key value */
    accesskey: string;
    /** Status: enable, disable, remove */
    status: 'enable' | 'disable' | 'remove';
}

/**
 * Request to update permissions
 */
export interface UpdatePermissionRequest {
    /** Permission level: read, write, full, none */
    selected_permission: 'read' | 'write' | 'full' | 'none';
    /** Access key */
    selected_key: string;
}

/**
 * Request to update access policy
 */
export interface UpdatePolicyRequest {
    /** Policy type: public, private, upload */
    policy: 'public' | 'private' | 'upload';
}

/**
 * Request to create directory
 */
export interface CreateDirectoryRequest {
    /** Directory path */
    path: string;
}

/**
 * Request to upload file
 */
export interface UploadFileRequest {
    /** File object */
    file: File | Buffer;
    /** File path */
    path: string;
}

/**
 * Request to get sharable URL
 */
export interface GetSharableUrlRequest {
    /** File path */
    path: string;
    /** Expiry time */
    expire: string;
}

/**
 * Error response from Utho API
 */
export interface UthoError {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** HTTP status code */
    statusCode: number;
    /** Request ID */
    requestId?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
    /** Response data */
    data: T;
    /** HTTP status code */
    status: number;
    /** Response headers */
    headers: Record<string, string>;
}

/**
 * Duration options for sharable URLs
 * - Seconds: '30s', '60s'
 * - Minutes: '15m', '30m', '60m'
 * - Hours: '1h', '2h', '24h'
 * - Days: '1d', '7d', '30d'
 * - Months: '1M', '6M'
 * - Years: '1y'
 * - Never: 'never' (permanent link)
 */
export type ShareableDuration = 
    | `${number}s`   // seconds
    | `${number}m`   // minutes
    | `${number}h`   // hours
    | `${number}d`   // days
    | `${number}M`   // months
    | `${number}y`   // years
    | 'never';       // permanent

/**
 * Common duration presets for convenience
 */
export const DurationPresets = {
    /** 30 seconds */
    SECONDS_30: '30s' as ShareableDuration,
    /** 15 minutes */
    MINUTES_15: '15m' as ShareableDuration,
    /** 1 hour */
    HOUR_1: '1h' as ShareableDuration,
    /** 1 day */
    DAY_1: '1d' as ShareableDuration,
    /** 1 week */
    WEEK_1: '7d' as ShareableDuration,
    /** 1 month */
    MONTH_1: '1M' as ShareableDuration,
    /** 1 year */
    YEAR_1: '1y' as ShareableDuration,
    /** Never expires */
    NEVER: 'never' as ShareableDuration
} as const;