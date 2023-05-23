import {
    KPI_TOKENS_MANAGER_ABI,
    CHAIN_ADDRESSES,
    KPI_TOKEN_ABI,
    ORACLE_ABI,
    FACTORY_ABI,
    ChainId,
    ORACLES_MANAGER_ABI,
} from "../../commons";
import { KPIToken } from "../../entities/kpi-token";
import { type OnChainTemplate, Template } from "../../entities/template";
import { Oracle } from "../../entities/oracle";
import { enforce } from "../../utils";
import {
    FetchEntitiesParams,
    FetchKPITokenAddressesParams,
    FetchKPITokensAmountParams,
    FetchTemplatesParams,
    IPartialCarrotFetcher,
} from "../abstraction";
import { type Address, getContract, PublicClient } from "viem";

// TODO: check if validation can be extracted in its own function
class Fetcher implements IPartialCarrotFetcher {
    public supportedInChain(): boolean {
        return true;
    }

    public async fetchKPITokensAmount({
        publicClient,
    }: FetchKPITokensAmountParams): Promise<number> {
        const chainId = await publicClient.getChainId();
        enforce(chainId in ChainId, `unsupported chain with id ${chainId}`);
        const chainAddresses = CHAIN_ADDRESSES[chainId as ChainId];
        const amount = await publicClient.readContract({
            abi: FACTORY_ABI,
            address: chainAddresses.factory,
            functionName: "kpiTokensAmount",
        });
        return Number(amount);
    }

    public async fetchKPITokenAddresses({
        publicClient,
        fromIndex,
        toIndex,
    }: FetchKPITokenAddressesParams): Promise<Address[]> {
        const chainId = await publicClient.getChainId();
        enforce(chainId in ChainId, `unsupported chain with id ${chainId}`);
        const chainAddresses = CHAIN_ADDRESSES[chainId as ChainId];
        const finalFromIndex = !fromIndex || fromIndex < 0 ? 0 : fromIndex;
        const finalToIndex = !toIndex
            ? await this.fetchKPITokensAmount({ publicClient })
            : toIndex;
        return (
            await publicClient.readContract({
                abi: FACTORY_ABI,
                address: chainAddresses.factory,
                functionName: "enumerate",
                args: [BigInt(finalFromIndex), BigInt(finalToIndex)],
            })
        ).slice();
    }

    public async fetchKPITokens({
        publicClient,
        addresses,
    }: FetchEntitiesParams): Promise<{ [address: string]: KPIToken }> {
        const chainId = await publicClient.getChainId();
        enforce(chainId in ChainId, `unsupported chain with id ${chainId}`);
        const chainAddresses = CHAIN_ADDRESSES[chainId as ChainId];

        let tokenAddresses: Address[];
        let kpiTokenAmounts;
        if (addresses && addresses.length > 0) {
            kpiTokenAmounts = addresses.length;
            tokenAddresses = addresses;
        } else {
            kpiTokenAmounts = await this.fetchKPITokensAmount({
                publicClient,
            });
            if (kpiTokenAmounts === 0) return {};
            tokenAddresses = (await publicClient.readContract({
                abi: FACTORY_ABI,
                address: chainAddresses.factory,
                functionName: "enumerate",
                args: [0n, BigInt(kpiTokenAmounts)],
            })) as Address[];
        }

        const kpiTokenResult = await publicClient.multicall({
            allowFailure: false,
            contracts: tokenAddresses.flatMap((address) => {
                return [
                    {
                        address,
                        abi: KPI_TOKEN_ABI,
                        functionName: "finalized",
                    },
                    {
                        address,
                        abi: KPI_TOKEN_ABI,
                        functionName: "description",
                    },
                    {
                        address,
                        abi: KPI_TOKEN_ABI,
                        functionName: "template",
                    },
                    {
                        address,
                        abi: KPI_TOKEN_ABI,
                        functionName: "oracles",
                    },
                    {
                        address,
                        abi: KPI_TOKEN_ABI,
                        functionName: "expiration",
                    },
                    {
                        address,
                        abi: KPI_TOKEN_ABI,
                        functionName: "creationTimestamp",
                    },
                    {
                        address,
                        abi: KPI_TOKEN_ABI,
                        functionName: "owner",
                    },
                ];
            }),
        });

        const allOracleAddresses: Address[] = [];
        for (let i = 3; i < kpiTokenResult.length; i += 7)
            allOracleAddresses.push(...(kpiTokenResult[i] as Address[]));

        const oracles = await this.fetchOracles({
            publicClient,
            addresses: allOracleAddresses,
        });

        const allKPITokens: Record<string, KPIToken> = {};
        const iUpperLimit =
            addresses && addresses.length > 0
                ? addresses.length
                : kpiTokenAmounts;
        outerLoop: for (let i = 0; i < iUpperLimit; i++) {
            const kpiTokenFinalized = kpiTokenResult[i * 7] as boolean;
            const kpiTokenDescriptionCID = kpiTokenResult[i * 7 + 1] as string;

            const kpiTokenTemplate = kpiTokenResult[
                i * 7 + 2
            ] as OnChainTemplate;

            const kpiTokenOracleAddresses = kpiTokenResult[
                i * 7 + 3
            ] as Address[];
            const kpiTokenExpiration = Number(
                kpiTokenResult[i * 7 + 4] as bigint
            );
            const kpiTokenCreationTimestamp = Number(
                kpiTokenResult[i * 7 + 5] as bigint
            );
            const kpiTokenOwner = kpiTokenResult[i * 7 + 6] as Address;

            const kpiTokenOracles: Oracle[] = [];
            for (const address of kpiTokenOracleAddresses) {
                const oracle = oracles[address];
                if (!oracle) continue outerLoop;
                kpiTokenOracles.push(oracle);
            }

            const template = new Template(
                Number(kpiTokenTemplate.id),
                kpiTokenTemplate.addrezz,
                Number(kpiTokenTemplate.version),
                kpiTokenTemplate.specification
            );

            const kpiTokenAddress = tokenAddresses[i];
            allKPITokens[kpiTokenAddress] = new KPIToken(
                chainId,
                kpiTokenAddress,
                kpiTokenOwner,
                template,
                kpiTokenOracles,
                kpiTokenDescriptionCID,
                kpiTokenExpiration,
                kpiTokenCreationTimestamp,
                kpiTokenFinalized
            );
        }
        return allKPITokens;
    }

    public async fetchOracles({
        publicClient,
        addresses,
    }: FetchEntitiesParams): Promise<{ [address: string]: Oracle }> {
        const chainId = await publicClient.getChainId();
        enforce(chainId in ChainId, `unsupported chain with id ${chainId}`);
        const chainAddresses = CHAIN_ADDRESSES[chainId as ChainId];
        const oraclesManager = getContract({
            abi: ORACLES_MANAGER_ABI,
            address: chainAddresses.oraclesManager,
            publicClient: publicClient,
        });

        const oracleAmounts = await oraclesManager.read.templatesAmount();
        if (oracleAmounts == 0n) return {};
        const oracleAddresses =
            addresses && addresses.length > 0
                ? addresses
                : (
                      await oraclesManager.read.enumerate([0n, oracleAmounts])
                  ).map((oracle) => oracle.addrezz);

        const oraclesResult = await publicClient.multicall({
            allowFailure: false,
            contracts: oracleAddresses.flatMap((address) => {
                return [
                    { address, abi: ORACLE_ABI, functionName: "template" },
                    { address, abi: ORACLE_ABI, functionName: "finalized" },
                ];
            }),
        });

        const oracles: { [address: string]: Oracle } = {};
        for (let i = 0; i < oracleAddresses.length; i++) {
            const {
                id: templateId,
                addrezz: templateAddress,
                specification,
                version,
            } = oraclesResult[i * 2] as OnChainTemplate;
            const oracleAddress = oracleAddresses[i];
            const template = new Template(
                Number(templateId),
                templateAddress,
                Number(version),
                specification
            );
            oracles[oracleAddress] = new Oracle(
                chainId,
                oracleAddress,
                template,
                oraclesResult[i * 2 + 1] as boolean
            );
        }
        return oracles;
    }

    private async fetchTemplates(
        chainId: ChainId,
        publicClient: PublicClient,
        managerAddress: Address,
        ids?: number[]
    ): Promise<Template[]> {
        const managerContract = getContract({
            abi: KPI_TOKENS_MANAGER_ABI,
            address: managerAddress,
            publicClient: publicClient,
        });

        let rawTemplates;
        if (ids && ids.length > 0) {
            rawTemplates = await publicClient.multicall({
                allowFailure: false,
                contracts: ids.map((id) => {
                    return {
                        address: managerAddress,
                        abi: KPI_TOKENS_MANAGER_ABI,
                        functionName: "template",
                        args: [BigInt(id)],
                    };
                }),
            });
        } else {
            const templatesAmount =
                await managerContract.read.templatesAmount();
            if (templatesAmount == 0n) return [];
            rawTemplates = await managerContract.read.enumerate([
                0n,
                templatesAmount,
            ]);
        }

        return rawTemplates.map((rawTemplate) => {
            return new Template(
                Number(rawTemplate.id),
                rawTemplate.addrezz,
                Number(rawTemplate.version),
                rawTemplate.specification
            );
        });
    }

    public async fetchKPITokenTemplates({
        publicClient,
        ids,
    }: FetchTemplatesParams): Promise<Template[]> {
        const chainId = await publicClient.getChainId();
        enforce(chainId in ChainId, `unsupported chain with id ${chainId}`);
        return await this.fetchTemplates(
            chainId,
            publicClient,
            CHAIN_ADDRESSES[chainId as ChainId].kpiTokensManager,
            ids
        );
    }

    public async fetchOracleTemplates({
        publicClient,
        ids,
    }: FetchTemplatesParams): Promise<Template[]> {
        const chainId = await publicClient.getChainId();
        enforce(chainId in ChainId, `unsupported chain with id ${chainId}`);
        return await this.fetchTemplates(
            chainId,
            publicClient,
            CHAIN_ADDRESSES[chainId as ChainId].oraclesManager,
            ids
        );
    }
}

export const OnChainFetcher = new Fetcher();
