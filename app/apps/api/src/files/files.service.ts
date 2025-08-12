import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FilesService {
  private s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY!, secretAccessKey: process.env.S3_SECRET_KEY! }
  });

  async presign(key: string, contentType: string) {
    const cmd = new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: contentType });
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: 60 * 5 });
    return { url, key, bucket: process.env.S3_BUCKET };
  }
}
