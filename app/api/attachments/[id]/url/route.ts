import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getFileUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const attachment = await prisma.requestAttachment.findUnique({ where: { id: params?.id } })
    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }
    const url = await getFileUrl(attachment.cloud_storage_path, attachment.isPublic)
    return NextResponse.json({ url, fileName: attachment.fileName })
  } catch (err) {
    console.error('Download URL error:', err)
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
  }
}
