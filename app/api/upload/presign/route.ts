import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireTenant, isResponse } from '@/src/server/auth';
import { randomUUID } from 'crypto';

// POST /api/upload/presign
// Returns a presigned R2 PUT URL. The client uploads directly to R2 from the browser.
// Body: { filename: string, contentType: string, folder?: string }
// Response: { uploadUrl, publicUrl, key }
export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;

  const { filename, contentType, folder = 'uploads' } = await req.json();
  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return NextResponse.json({ error: 'R2 storage is not configured' }, { status: 503 });
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? 'bin';
  const key = `${folder}/${auth.tenantId}/${randomUUID()}.${ext}`;

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 min

  return NextResponse.json({
    uploadUrl,
    publicUrl: `${publicUrl.replace(/\/$/, '')}/${key}`,
    key,
  });
}
