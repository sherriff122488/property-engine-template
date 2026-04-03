import { PageHeader } from '@/components/shared/PageHeader'
import { DealAnalyser } from '@/components/deal-analyser/DealAnalyser'
import { listDeals } from '@/lib/actions/deal-analyses'

export const metadata = { title: 'Deal Analyser' }

export default async function DealAnalyserPage() {
  const savedDeals = await listDeals()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deal Analyser"
        description="Model acquisition costs, bridge finance and returns before committing to a deal"
      />
      <DealAnalyser savedDeals={savedDeals} />
    </div>
  )
}
