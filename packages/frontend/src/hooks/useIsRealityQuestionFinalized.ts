import { useEffect, useMemo, useState } from 'react'
import { useSingleCallResult } from '@carrot-kpi/react'
import { useRealityContract } from './useRealityContract'

export function useIsRealityQuestionFinalized(kpiId?: string): { loading: boolean; finalized: boolean } {
  const realityContract = useRealityContract(false)
  const callParams = useMemo(() => [kpiId], [kpiId])
  const wrappedResult = useSingleCallResult(realityContract, 'isFinalized', callParams)

  const [loading, setLoading] = useState(true)
  const [finalized, setFinalized] = useState(false)

  useEffect(() => {
    if (!kpiId || !realityContract) return
    if (wrappedResult.loading) {
      setLoading(true)
      setFinalized(false)
      return
    }
    if (wrappedResult.error || !wrappedResult.result || wrappedResult.result.length === 0) {
      console.error('could not fetch reality question finalization status')
      setLoading(true)
      setFinalized(false)
      return
    }
    setLoading(false)
    setFinalized(wrappedResult.result[0])
  }, [kpiId, realityContract, wrappedResult.error, wrappedResult.loading, wrappedResult.result])

  return { loading, finalized }
}
