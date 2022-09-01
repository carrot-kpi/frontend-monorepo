import { AbstractConnector } from '@web3-react/abstract-connector'
import { Amount, ChainId, Currency } from '@carrot-kpi/core-sdk'
import Decimal from 'decimal.js-light'
import { BigNumber } from '@ethersproject/bignumber'
import { injected, RPC_URL, walletConnect } from '../connectors'
import metamaskLogo from '../assets/metamask-logo.webp'
import walletConnectLogo from '../assets/wallet-connect-logo.png'
import ethereumLogo from '../assets/ethereum-logo.png'
import xDaiLogo from '../assets/svgs/xdai-logo.svg'
import { parseUnits } from '@ethersproject/units'
import { JsonRpcProvider } from '@ethersproject/providers'
import REALITY3_ABI from './abis/reality-3.0.json'

export const ZERO_USD = new Amount<Currency>(Currency.USD, BigNumber.from(0))
export const ZERO_DECIMAL = new Decimal(0)

export const INVALID_REALITY_ANSWER = BigNumber.from(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
)

export const REALITY3_ADDRESS: Record<ChainId, string> = {
  [ChainId.MAINNET]: '0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47',
  [ChainId.RINKEBY]: '0xDf33060F476F8cff7511F806C72719394da1Ad64',
  [ChainId.GOERLI]: '0x6F80C5cBCF9FbC2dA2F0675E56A5900BB70Df72f',
  [ChainId.GNOSIS]: '0x79e32aE03fb27B07C89c0c568F80287C01ca2E57',
}

export interface WalletInfo {
  connector: AbstractConnector
  name: string
  icon: string
}

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    connector: walletConnect,
    name: 'WalletConnect',
    icon: walletConnectLogo,
  },
]
if (window.ethereum) {
  SUPPORTED_WALLETS.push({
    connector: injected,
    name: 'MetaMask',
    icon: metamaskLogo,
  })
}

export interface NetworkDetails {
  chainId: string
  chainName: string
  icon: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  defaultBond: BigNumber
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

export const NETWORK_DETAIL: { [chainId: number]: NetworkDetails } = {
  [ChainId.GNOSIS]: {
    chainId: `0x${ChainId.GNOSIS.toString(16)}`,
    chainName: 'xDai',
    icon: xDaiLogo,
    nativeCurrency: {
      name: 'xDai',
      symbol: 'xDAI',
      decimals: 18,
    },
    defaultBond: parseUnits('10', 18),
    rpcUrls: ['https://rpc.xdaichain.com'],
    blockExplorerUrls: ['https://blockscout.com/xdai/mainnet'],
  },
  [ChainId.MAINNET]: {
    chainId: `0x${ChainId.MAINNET.toString(16)}`,
    chainName: 'Mainnet',
    icon: ethereumLogo,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    defaultBond: parseUnits('0.01', 18),
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
}
if (process.env.NODE_ENV !== 'production') {
  NETWORK_DETAIL[ChainId.RINKEBY] = {
    chainId: `0x${ChainId.RINKEBY.toString(16)}`,
    chainName: 'Rinkeby',
    icon: ethereumLogo,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    defaultBond: parseUnits('0.1', 18),
    rpcUrls: ['https://rinkeby.infura.io/v3'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
  }
}

export const MAINNET_PROVIDER = new JsonRpcProvider(RPC_URL[ChainId.MAINNET])

export { REALITY3_ABI }
