import MULTICALL2_ABI from '../abis/multicall2.json'
import ERC20_ABI from '../abis/erc20.json'

export const INFURA_PROJECT_ID = '0ebf4dd05d6740f482938b8a80860d13'
export const POCKET_ID = '61d8970ca065f5003a112e86'
export const IPFS_GATEWAY = 'https://dxgov.mypinata.cloud/ipfs/'
export const WEB3_NETWORK_CONTEXT_NAME = 'NETWORK_CONTEXT'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export enum ChainId {
  MAINNET = 1,
  RINKEBY = 4,
  GOERLI = 5,
  GNOSIS = 100,
}

export const MULTICALL2_ADDRESS: Record<ChainId, string> = {
  [ChainId.MAINNET]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.RINKEBY]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.GOERLI]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.GNOSIS]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696', // FIXME: might be wrong
}

export { MULTICALL2_ABI, ERC20_ABI }
