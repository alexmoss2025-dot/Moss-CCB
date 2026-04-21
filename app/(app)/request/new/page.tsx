import { RequestForm } from './request-form'
import { Container } from '@/components/layouts/container'

export const dynamic = 'force-dynamic'

export default function NewRequestPage() {
  return (
    <Container size="lg" className="py-10">
      <RequestForm />
    </Container>
  )
}
