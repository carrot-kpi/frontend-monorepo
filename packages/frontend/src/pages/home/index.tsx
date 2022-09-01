import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { injected } from '../../connectors'
import { useActiveWeb3React, useKpiTokens } from '@carrot-kpi/react'

export const Home = () => {
  const { account, activate, error } = useActiveWeb3React()
  const { loading, kpiTokens } = useKpiTokens()

  const handleActivate = useCallback(() => {
    activate(injected)
  }, [activate])

  return (
    <>
      {!account && <button onClick={handleActivate}>Connect wallet</button>}
      {account && (
        <Link to="/create">
          <button>Create KPI token</button>
        </Link>
      )}
      {error}
      {loading && <>Loading...</>}
      {!loading && kpiTokens.length > 0 && (
        <ul>
          {kpiTokens.map((token: any) => (
            <li key={token.address}>
              {token.description.title}{' '}
              <Link to={`/campaigns/${token.address}`}>
                <button>See</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!loading && kpiTokens.length === 0 && <>No KPI tokens</>}
    </>
  )
}
