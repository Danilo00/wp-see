import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { debugLog } from "./debug";
import { isMongoConfigured } from "./mongodb";

let client: S3Client | null = null;

export function isS3Configured(): boolean {
  return Boolean(
    process.env.AWS_S3_BUCKET?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  );
}

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_REGION?.trim() || "eu-west-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
      },
    });
  }
  return client;
}

export function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  if (!bucket) throw new Error("AWS_S3_BUCKET non configurato");
  return bucket;
}

export function chatMediaKey(chatSlug: string, filename: string): string {
  return `chats/${chatSlug}/media/${filename}`;
}

export function chatZipKey(importId: string, filename: string): string {
  return `imports/${importId}/${filename}`;
}

export async function uploadBuffer(
  key: string,
  body: Buffer,
  contentType?: string,
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType ?? "application/octet-stream",
    }),
  );
  debugLog(4, "s3", "Uploaded object", { key, bytes: body.length });
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await getClient().send(new HeadObjectCommand({ Bucket: getBucket(), Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const res = await getClient().send(
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
  );
  const bytes = await res.Body?.transformToByteArray();
  if (!bytes) throw new Error(`Oggetto S3 vuoto: ${key}`);
  return Buffer.from(bytes);
}

export async function getSignedMediaUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn },
  );
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 900,
): Promise<string> {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn },
  );
}

export function chatMediaPrefix(chatSlug: string): string {
  return `chats/${chatSlug}/`;
}

export async function deletePrefix(prefix: string): Promise<number> {
  let deleted = 0;
  let token: string | undefined;

  do {
    const list = await getClient().send(
      new ListObjectsV2Command({
        Bucket: getBucket(),
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );

    const keys = (list.Contents ?? [])
      .map((o) => o.Key)
      .filter((k): k is string => Boolean(k));

    if (keys.length > 0) {
      await getClient().send(
        new DeleteObjectsCommand({
          Bucket: getBucket(),
          Delete: { Objects: keys.map((Key) => ({ Key })) },
        }),
      );
      deleted += keys.length;
    }

    token = list.NextContinuationToken;
  } while (token);

  debugLog(3, "s3", "Prefix deleted", { prefix, deleted });
  return deleted;
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

export function isCloudStorageEnabled(): boolean {
  return isMongoConfigured() && isS3Configured();
}

export function getStorageMode(): "cloud" | "local" {
  const forced = process.env.STORAGE_MODE?.trim().toLowerCase();
  if (forced === "cloud") return "cloud";
  if (forced === "local") return "local";
  return isCloudStorageEnabled() ? "cloud" : "local";
}
