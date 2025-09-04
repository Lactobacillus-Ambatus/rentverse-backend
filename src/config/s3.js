const { S3Client } = require('@aws-sdk/client-s3');

// Check if S3 is configured
const isS3Configured =
  process.env.S3_ENDPOINT &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY &&
  process.env.S3_ACCESS_KEY_ID !== 'your_access_key_id_here' &&
  process.env.S3_SECRET_ACCESS_KEY !== 'your_secret_access_key_here';

let s3Client = null;

if (isS3Configured) {
  try {
    s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true, // Required for S3 compatible storages like Supabase
      signatureVersion: 'v4',
    });

    console.log('✅ S3 storage configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure S3 storage:', error.message);
  }
} else {
  console.warn(
    '⚠️ S3 storage not configured. File upload features will be disabled.'
  );
  console.warn(
    'Please set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY in your .env file'
  );
}

const STORAGE_BUCKET = process.env.S3_BUCKET || 'rentverse-uploads';
const STORAGE_URL = isS3Configured
  ? `${process.env.S3_PUBLIC_URL}/storage/v1/object/public/${STORAGE_BUCKET}`
  : null;

module.exports = {
  s3Client,
  STORAGE_BUCKET,
  STORAGE_URL,
  isS3Configured,
};
