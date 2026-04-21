import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createS3Client, getBucketConfig } from './aws-config'

const REGION = process.env.AWS_REGION ?? 'us-east-1'

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic: boolean = false
): Promise<{ uploadUrl: string; cloud_storage_path: string }> {
  const { bucketName, folderPrefix } = getBucketConfig()
  const safeName = (fileName ?? 'file').replace(/[^a-zA-Z0-9._-]/g, '_')
  const keyBase = isPublic ? `${folderPrefix}public/uploads/` : `${folderPrefix}uploads/`
  const cloud_storage_path = `${keyBase}${Date.now()}-${safeName}`

  const client = createS3Client()
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
    ContentDisposition: isPublic ? 'attachment' : undefined,
  })
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 60 })
  return { uploadUrl, cloud_storage_path }
}

export async function getFileUrl(
  cloud_storage_path: string,
  isPublic: boolean = false
): Promise<string> {
  const { bucketName } = getBucketConfig()
  if (isPublic) {
    return `https://${bucketName}.s3.${REGION}.amazonaws.com/${cloud_storage_path}`
  }
  const client = createS3Client()
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ResponseContentDisposition: 'attachment',
  })
  return getSignedUrl(client, command, { expiresIn: 3600 })
}

export async function deleteFile(cloud_storage_path: string): Promise<void> {
  const { bucketName } = getBucketConfig()
  const client = createS3Client()
  await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }))
}
