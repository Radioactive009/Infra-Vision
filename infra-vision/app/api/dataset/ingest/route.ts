// app/api/dataset/ingest/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
// import csv from 'csv-parser'; // Unused - placeholder for future implementation
// import * as XLSX from 'xlsx'; // Unused - placeholder for future implementation

export async function POST(req: NextRequest) {
  const { projectId, fileKey, fileType, name } = await req.json();
  if (!projectId || !fileKey || !fileType || !name) {
    return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_PUBLIC_URL,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: fileKey });
  const file = await s3.send(cmd);

  let parsedRows = [];
  if (fileType === 'CSV') {
    // parse CSV from stream
    // ...implement parser (NOTE: streaming CSV parsing in serverless is fragile, placeholder)
  } else if (fileType === 'XLSX') {
    // ...implement XLSX parser
  } else if (fileType === 'GEOJSON') {
    // ...handle
  }

  // Save or update Dataset record
  await prisma.dataset.create({
    data: {
      name,
      type: fileType,
      originalUrl: fileKey,
      cloudUrl: `https://your-cloudflare-url/${fileKey}`,
      projectId,
      meta: {}, // Optionally store parsed sample/headers/feature info
    },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}





