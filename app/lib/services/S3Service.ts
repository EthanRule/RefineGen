import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const IMAGE_EXPIRATION_LIFETIME = 7 * 24 * 3600; // 7 Days.

// This class can upload images to the aws s3 bucket. The s3 bucket is a file
// system where each user has their own folder of images.
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    if (
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.S3_BUCKET_NAME
    ) {
      throw Error('Missing required AWS environment variables.');
    }
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME!;
  }

  // The uploadImage function uploads the image to the aws s3 bucket
  // using the servers AWS credentials and the users userId.Then 
  // returns a presigned url to the image within the bucket.
  // This presigned url is really just a url to the image with a
  // cryptigraphic signature on the end. Notice that the url returned
  // has an expiration lifetime. Once the image is expired, it can
  // no longer be viewed.
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

    // Generate presigned URL for temporary shareable access.
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, getCommand, {
      expiresIn: IMAGE_EXPIRATION_LIFETIME,
    });

    return presignedUrl;
  }

  private generateImageKey(
    userId: string,
    imageId: string,
    extension: string = 'png'
  ): string {
    return `users/${userId}/images/${imageId}.${extension}`;
  }
}
