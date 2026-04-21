import { DashboardClient } from './dashboard-client'
import { Container } from '@/components/layouts/container'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <Container size="xl" className="py-8">
      <DashboardClient />
    </Container>
  )
}
