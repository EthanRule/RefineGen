import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME!;
  }

  private generateImageKey(
    userId: string,
    imageId: string,
    extension: string = 'png'
  ): string {
    return `users/${userId}/images/${imageId}.${extension}`;
  }

  async uploadImage(
    userId: string,
    imageId: string,
    imageBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    const key = this.generateImageKey(userId, imageId);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
      Metadata: {
        userId: userId,
        imageId: imageId,
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);

    // Generate presigned URL for private access
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, getCommand, {
      expiresIn: 3600 * 24 * 7, // 7 days
    });

    return presignedUrl;
  }
}
