import { Currency } from '@carrot-kpi/core-sdk'
import { useActiveWeb3React } from './useActiveWeb3React'

export function useNativeCurrency(): Currency {
  const { chainId } = useActiveWeb3React()
  // fallback to ether if chain id is not defined
  if (!chainId) return Currency.ETHER
  return Currency.getNative(chainId) || Currency.ETHER
}
