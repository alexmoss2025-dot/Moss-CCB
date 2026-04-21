import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Container } from '@/components/layouts/container'
import { RequestDetail } from './request-detail'

export const dynamic = 'force-dynamic'

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const request = await prisma.softwareRequest.findUnique({
    where: { id: params?.id },
    include: { attachments: true },
  })
  if (!request) return notFound()

  // Serialize dates
  const serialized = {
    ...request,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    attachments: (request.attachments ?? []).map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  }

  return (
    <Container size="lg" className="py-8">
      <RequestDetail initialRequest={serialized as any} />
    </Container>
  )
}
