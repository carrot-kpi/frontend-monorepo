import { useEffect, useState } from "react";
import { Fetcher, Oracle } from "@carrot-kpi/sdk";
import { useProvider, useNetwork } from "wagmi";
import { usePreferDecentralization } from "./usePreferDecentralization";

export function useOracle(oracleAddress?: string): {
    loading: boolean;
    oracle: Oracle | null;
} {
    const preferDecentralization = usePreferDecentralization();
    const { chain } = useNetwork();
    const provider = useProvider();

    const [oracle, setOracle] = useState<Oracle | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function fetchData(): Promise<void> {
            if (!chain || !oracleAddress) return;
            if (!cancelled) setLoading(true);
            try {
                const fetchedOracle = (
                    await Fetcher.fetchOracles({
                        provider,
                        preferDecentralization,
                        addresses: [oracleAddress],
                    })
                )[oracleAddress];
                if (!fetchedOracle) return;
                if (!cancelled) setOracle(fetchedOracle);
            } catch (error) {
                console.error(
                    `error fetching oracle at address ${oracleAddress}`,
                    error
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        void fetchData();
        return () => {
            cancelled = true;
        };
    }, [chain, oracleAddress, preferDecentralization, provider]);

    return { loading, oracle };
}
