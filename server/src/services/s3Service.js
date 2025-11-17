import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3=new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_FOR_SANGAM_S3_STORAGE ,
        secretAccessKey: process.env.AWS_SECRET_KET_FOR_SANGAM_S3_STORAGE 
    },
});

export async function uploadFileToS3({ key, buffer, contentType, cacheControl }) {
    if (!key) {
        throw new Error("uploadFileToS3 requires a key");
    }

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType ?? "application/octet-stream",
        CacheControl: cacheControl ?? "public, max-age=31536000",
        ACL: "public-read", // drop this line if your bucket is private
    });

    await s3.send(command);

    return {
        key,
        url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`,
    };
}

export async function deleteFileFromS3(key) {
    if (!key) {
        throw new Error("deleteFileFromS3 requires a key");
    }

    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });

    await s3.send(command);
}

export async function getSignedFileUrl(key, expiresInSeconds = 60) {
    if (!key) {
        throw new Error("getSignedFileUrl requires a key");
    }

    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}


