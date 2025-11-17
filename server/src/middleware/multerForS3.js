import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_FOR_SANGAM_S3_STORAGE,
        secretAccessKey: process.env.AWS_SECRET_KET_FOR_SANGAM_S3_STORAGE,
    },
});

const uploadToS3 = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const timestamp = Date.now();
            const safeName = file.originalname.replace(/\s+/g, "-");
            cb(null, `uploads/${timestamp}-${safeName}`);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type"), false);
        }
    },
});

export default uploadToS3;