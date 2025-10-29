import { S3Service } from '../../../lib/services/S3Service';

jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn();
  const mockS3Client = jest.fn(() => ({
    send: mockSend,
  }));

  const mockPutObjectCommand = jest.fn(input => ({ input }));
  const mockGetObjectCommand = jest.fn(input => ({ input }));
  const mockDeleteObjectCommand = jest.fn(input => ({ input }));

  return {
    S3Client: mockS3Client,
    PutObjectCommand: mockPutObjectCommand,
    GetObjectCommand: mockGetObjectCommand,
    DeleteObjectCommand: mockDeleteObjectCommand,
    mockSend,
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Service', () => {
  let s3Service: S3Service;
  let mockSend: jest.Mock;
  let mockGetSignedUrl: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment variables
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_REGION = 'us-east-1';
    process.env.S3_BUCKET_NAME = 'test-bucket';

    s3Service = new S3Service();

    const { mockSend: mockSendFn } = require('@aws-sdk/client-s3');
    mockSend = mockSendFn;
    mockGetSignedUrl = require('@aws-sdk/s3-request-presigner').getSignedUrl;
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockUserId = 'user123';
      const mockImageId = 'image123';
      const mockContentType = 'image/jpeg';
      const mockPresignedUrl =
        'https://test-bucket.s3.amazonaws.com/users/user123/images/image123.png?signature=test';

      mockSend.mockResolvedValue({});
      mockGetSignedUrl.mockResolvedValue(mockPresignedUrl);

      const result = await s3Service.uploadImage(
        mockUserId,
        mockImageId,
        mockBuffer,
        mockContentType
      );

      expect(result).toBe(mockPresignedUrl);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: 'users/user123/images/image123.png',
            Body: mockBuffer,
            ContentType: mockContentType,
            Metadata: expect.objectContaining({
              userId: mockUserId,
              imageId: mockImageId,
            }),
          }),
        })
      );
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object), // S3Client instance
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: 'users/user123/images/image123.png',
          }),
        }),
        { expiresIn: 3600 * 24 * 7 } // 7 days
      );
    });

    it('should handle upload errors', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockUserId = 'user123';
      const mockImageId = 'image123';
      const mockContentType = 'image/jpeg';

      mockSend.mockRejectedValue(new Error('Upload failed'));

      await expect(
        s3Service.uploadImage(mockUserId, mockImageId, mockBuffer, mockContentType)
      ).rejects.toThrow('Upload failed');
    });

    it('should handle missing environment variables', async () => {
      delete process.env.S3_BUCKET_NAME;

      // S3Service constructor should throw immediately when env vars are missing
      expect(() => new S3Service()).toThrow('Missing required AWS environment variables.');
    });
  });

  describe('generateImageKey', () => {
    it('should generate correct image key', () => {
      const userId = 'user123';
      const imageId = 'image456';

      // Access private method through any cast for testing
      const key = (s3Service as any).generateImageKey(userId, imageId);

      expect(key).toBe('users/user123/images/image456.png');
    });

    it('should generate key with custom extension', () => {
      const userId = 'user123';
      const imageId = 'image456';
      const extension = 'jpg';

      const key = (s3Service as any).generateImageKey(userId, imageId, extension);

      expect(key).toBe('users/user123/images/image456.jpg');
    });
  });

  describe('Presigned URL Generation', () => {
    it('should handle presigned URL generation errors', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockUserId = 'user123';
      const mockImageId = 'image123';
      const mockContentType = 'image/jpeg';

      mockSend.mockResolvedValue({});
      mockGetSignedUrl.mockRejectedValue(new Error('Presigned URL generation failed'));

      await expect(
        s3Service.uploadImage(mockUserId, mockImageId, mockBuffer, mockContentType)
      ).rejects.toThrow('Presigned URL generation failed');
    });
  });

  describe('Metadata', () => {
    it('should include correct metadata in upload', async () => {
      const mockBuffer = Buffer.from('test-image-data');
      const mockUserId = 'user123';
      const mockImageId = 'image123';
      const mockContentType = 'image/jpeg';
      const mockPresignedUrl =
        'https://test-bucket.s3.amazonaws.com/users/user123/images/image123.png?signature=test';

      mockSend.mockResolvedValue({});
      mockGetSignedUrl.mockResolvedValue(mockPresignedUrl);

      await s3Service.uploadImage(mockUserId, mockImageId, mockBuffer, mockContentType);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Metadata: expect.objectContaining({
              userId: mockUserId,
              imageId: mockImageId,
              uploadedAt: expect.any(String),
            }),
          }),
        })
      );
    });
  });
});
