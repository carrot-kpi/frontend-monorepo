import { gql } from '@apollo/client'
import { AGAVE_SUBGRAPH_CLIENT } from '../../commons/graphql'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import Decimal from 'decimal.js-light'
import { getAddress } from '@ethersproject/address'
import { ChainId } from '../../commons/constants'
import { Currency } from '../../entities/currency'
import { Token } from '../../entities/token'
import { Amount } from '../../entities/amount'
import { getTimestampsFromRange } from '../../utils'
import { TvlPlatform } from './abstraction/tvl'
import { TokenPricePlatform } from './abstraction/token-price'
import { ChartDataPoint } from '../chart-data-point'
import { Fetcher } from '../../fetcher'

interface Reserve {
  price: { priceInEth: string }
  decimals: number
  symbol: string
  name: string
  underlyingAsset: string
  totalLiquidity: string
}

export class Agave implements TvlPlatform {
  get name(): string {
    return 'Agave'
  }

  public async overallTvl(
    chainId: ChainId,
    pricingPlatform: TokenPricePlatform,
    from: Date,
    to: Date,
    granularity: number
  ): Promise<ChartDataPoint[]> {
    if (!this.supportsChain(chainId)) throw new Error('tried to get agave overall tvl data on an invalid chain')
    const nativeCurrency = Currency.getNative(chainId)
    if (!nativeCurrency) throw new Error(`cannot find native currency for chain id ${chainId}`)
    const subgraph = AGAVE_SUBGRAPH_CLIENT[chainId]
    if (!subgraph) throw new Error('could not get agave subgraph client')

    const timestamps = getTimestampsFromRange(from, to, granularity)
    const blocks = await Fetcher.blocksFromTimestamps(chainId, timestamps)
    if (blocks.length === 0) return []

    const { data: agaveTvlData } = await subgraph.query<{
      [timestampString: string]: { reserves: Reserve[] }[]
    }>({
      query: gql`
        query overallTvl {
          ${blocks.map((block) => {
            return `t${block.timestamp}: pools(block: { number: ${block.number} }) {
              reserves(where: { totalLiquidity_gt: 0 }) {
                price {
                  priceInEth
                }
                decimals
                name
                symbol
                underlyingAsset
                totalLiquidity
              }
            }`
          })} 
        }
      `,
    })
    if (!agaveTvlData) return []
    const nativeCurrencyPriceUsd = await pricingPlatform.tokenPrice(
      Token.getNativeWrapper(chainId),
      from,
      to,
      granularity
    )
    const nativeCurrencyPriceUsdLookup = nativeCurrencyPriceUsd.reduce(
      (accumulator: { [timestampString: string]: Amount<Currency> }, item) => {
        accumulator[item.x] = new Amount(
          Currency.USD,
          parseUnits(new Decimal(item.y).toFixed(Currency.USD.decimals), Currency.USD.decimals)
        )
        return accumulator
      },
      {}
    )

    return Object.entries(agaveTvlData).reduce((accumulator: ChartDataPoint[], [timestampString, wrappedReserves]) => {
      let overallUsdReserve = new Amount(Currency.USD, BigNumber.from('0'))
      const timestamp = parseInt(timestampString.substring(1))

      for (const { reserves } of wrappedReserves) {
        for (const reserve of reserves) {
          const totalLiquidityBn = BigNumber.from(reserve.totalLiquidity)
          if (totalLiquidityBn.isZero()) continue
          const reserveAmount = new Amount(
            new Token(chainId, getAddress(reserve.underlyingAsset), reserve.decimals, reserve.symbol, reserve.name),
            totalLiquidityBn
          )
          const tokenNativeCurrencyPrice = new Amount(
            nativeCurrency,
            parseUnits(reserve.price.priceInEth, Math.max(nativeCurrency.decimals - 8, 0))
          )
          overallUsdReserve = overallUsdReserve.plus(
            reserveAmount.multiply(tokenNativeCurrencyPrice).multiply(nativeCurrencyPriceUsdLookup[timestamp])
          )
        }
      }

      accumulator.push({
        x: timestamp,
        y: overallUsdReserve.toFixed(2),
      })
      return accumulator
    }, [])
  }

  public supportsChain(chainId: ChainId): boolean {
    return chainId === ChainId.GNOSIS || chainId === ChainId.RINKEBY
  }
}
