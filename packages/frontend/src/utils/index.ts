import { BigNumber } from '@ethersproject/bignumber'
import { getAddress } from '@ethersproject/address'
import { NetworkDetails } from '../constants'
import { ChainId } from '@carrot-kpi/core-sdk'

const ETHERSCAN_PREFIXES: { [chainId in number]: string } = {
  1: '',
  4: 'rinkeby.',
}

const getExplorerPrefix = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.GNOSIS:
      return 'https://blockscout.com/xdai/mainnet'
    default:
      return `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`
  }
}

export function getExplorerLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const prefix = getExplorerPrefix(chainId)

  // exception. blockscout doesn't have a token-specific address
  if (chainId === ChainId.GNOSIS && type === 'token') {
    return `${prefix}/address/${data}`
  }

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

export function shortenAddress(address: string, chars = 4): string {
  const parsed = getAddress(address)
  if (!parsed) throw Error(`Invalid 'address' parameter '${address}'.`)
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export function addMarginToGasEstimation(gas: BigNumber): BigNumber {
  return gas.add(gas.mul(5).div(100))
}

export const switchOrAddNetwork = (networkDetails?: NetworkDetails, account?: string) => {
  if (!window.ethereum || !window.ethereum.request || !window.ethereum.isMetaMask || !networkDetails) return
  window.ethereum
    .request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkDetails.chainId }],
    })
    .catch((error) => {
      if (error.code !== 4902) {
        console.error('error switching to chain id', networkDetails.chainId, error)
      }
      if (!window.ethereum || !window.ethereum.request || !account) return
      window.ethereum
        .request({
          method: 'wallet_addEthereumChain',
          params: [{ ...networkDetails }, account],
        })
        .catch((error) => {
          console.error('error adding chain with id', networkDetails.chainId, error)
        })
    })
}

export const numberToByte32 = (num: string | number): string => {
  const hex = BigNumber.from(num).toHexString()

  const frontZeros = '0'.repeat(66 - hex.length)

  return `0x${frontZeros}${hex.split('0x')[1]}`
}
