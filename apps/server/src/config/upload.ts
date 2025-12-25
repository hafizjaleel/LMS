import { createHash } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';

if (!env.R2_ACCOUNT_ID) {
  throw new Error('R2_ACCOUNT_ID environment variable is required');
}
if (!env.R2_ACCESS_KEY_ID) {
  throw new Error('R2_ACCESS_KEY_ID environment variable is required');
}
if (!env.R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_SECRET_ACCESS_KEY environment variable is required');
}
if (!env.R2_BUCKET_NAME) {
  throw new Error('R2_BUCKET_NAME environment variable is required');
}


const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export interface UploadOptions {
  userId: string;
  documentType: string;
  companyId?: string;
  version?: number;
}
export class DocumentStorage {
  private generateFolderPath(options: UploadOptions): string {
    const { userId, documentType } = options;

    return `${documentType}/userId-${userId}`;
  }

  private generateFileName(file: File, options: UploadOptions): string {
    const { version = 1 } = options;
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');

    return `${timestamp}_v${version}_${sanitizedName}`;
  }

  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    return createHash('sha256').update(new Uint8Array(buffer)).digest('hex');
  }
async uploadDocument(file: File , options: UploadOptions) {
    const folderPath = this.generateFolderPath(options);
    const fileName = this.generateFileName(file, options);
    const key = `${folderPath}/${fileName}`;
    const checksum = await this.calculateChecksum(file);


    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
      Metadata: {
        userId: options.userId,
        documentType: options.documentType,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        checksum,
      },
    });

    await s3.send(command);
    return {
      key,
      originalFilename: file.name,
      storedFilename: fileName,
      filePath: folderPath,
      fileSize: file.size,
      mimeType: file.type,
      checksum,
    };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn });
  }
async deleteDocument(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);
  }
}

export const documentStorage = new DocumentStorage();