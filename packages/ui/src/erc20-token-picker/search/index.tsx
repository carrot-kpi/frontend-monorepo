import React, {
    ChangeEvent,
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { TextMono, TextMonoProps } from "../../text-mono";
import { ReactComponent as X } from "../../assets/x.svg";
import { Button, CarrotButtonProps } from "../../button";
import { TextInput, TextInputProps } from "../../input/text";
import { useDebounce } from "react-use";
import { TokenInfoWithBalance, TokenListWithBalance } from "../types";
import { cva } from "class-variance-authority";
import { RemoteLogo } from "../../remote-logo";
import {
    filterERC20Tokens,
    getDefaultERC20TokenLogoURL,
    sortERC20Tokens,
} from "../../utils/erc20";

const tokenItemStyles = cva(
    [
        "cui-flex",
        "cui-items-center",
        "cui-h-16",
        "cui-p-3",
        "hover:cui-bg-gray-200",
        "dark:hover:cui-bg-gray-700",
        "cui-cursor-pointer",
    ],
    {
        variants: {
            selected: {
                true: [
                    "cui-bg-gray-300",
                    "hover:cui-bg-gray-300",
                    "dark:cui-bg-gray-600",
                    "dark:hover:cui-bg-gray-600",
                ],
            },
        },
    }
);

export interface SearchProps {
    onDismiss?: () => void;
    onSelectedTokenChange?: (token: TokenInfoWithBalance) => void;
    selectedToken?: TokenInfoWithBalance | null;
    selectedList?: TokenListWithBalance;
    lists?: TokenListWithBalance[];
    chainId?: number;
    ipfsGatewayURL?: string;
    onManageLists: () => void;
    className?: {
        root?: string;
        headerContainer?: string;
        title?: TextMonoProps["className"];
        closeIcon?: string;
        divider?: string;
        inputContainer?: string;
        input?: TextInputProps["className"];
        listContainer?: string;
        listItem?: string;
        emptyListContainer?: string;
        manageListsButtonContainer?: string;
        manageListsButton?: CarrotButtonProps["className"];
    };
}

export const Search = ({
    onDismiss,
    onSelectedTokenChange,
    selectedToken,
    selectedList,
    lists,
    chainId,
    ipfsGatewayURL,
    onManageLists,
    className,
}: SearchProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    useEffect(() => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
    }, []);

    useDebounce(
        () => {
            setDebouncedSearchQuery(searchQuery);
        },
        300,
        [searchQuery]
    );

    const tokensInChain = useMemo(() => {
        if (!selectedList) return [];
        return selectedList.tokens.filter((token) => token.chainId === chainId);
    }, [chainId, selectedList]);

    const filteredTokens: TokenInfoWithBalance[] = useMemo(() => {
        return filterERC20Tokens(tokensInChain, debouncedSearchQuery);
    }, [debouncedSearchQuery, tokensInChain]);

    const sortedTokens: TokenInfoWithBalance[] = useMemo(() => {
        return sortERC20Tokens(filteredTokens);
    }, [filteredTokens]);

    const handleSearchChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(event.target.value);
        },
        [setSearchQuery]
    );

    const handleTokenClick = useCallback(
        (event: MouseEvent) => {
            if (!onSelectedTokenChange || !event.target) return;
            const index = (event.target as HTMLLIElement).dataset.index;
            if (index !== undefined) {
                const parsedIndex = parseInt(index);
                if (parsedIndex >= 0) {
                    onSelectedTokenChange(sortedTokens[parsedIndex]);
                    if (!!onDismiss) onDismiss();
                }
            }
        },
        [onDismiss, onSelectedTokenChange, sortedTokens]
    );

    return (
        <div
            className={`cui-bg-white dark:cui-bg-black cui-rounded-xl cui-border cui-border-black dark:cui-border-white sm:cui-w-full md:cui-w-1/3 lg:cui-w-1/4 ${className?.root}`}
        >
            <div
                className={`cui-p-3 cui-flex cui-justify-between cui-items-center ${className?.headerContainer}`}
            >
                <TextMono
                    weight="medium"
                    size="lg"
                    className={className?.title}
                >
                    Select a token
                </TextMono>
                <X
                    className={`cui-cursor-pointer ${className?.closeIcon}`}
                    onClick={onDismiss}
                />
            </div>
            <div
                className={`cui-h-[1px] cui-w-full cui-bg-black dark:cui-bg-white ${className?.divider}`}
            />
            <div className={`cui-p-3 ${className?.inputContainer}`}>
                <TextInput
                    id="token-search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={{
                        root: "cui-w-full",
                        input: "cui-w-full",
                        ...className?.input,
                    }}
                />
            </div>
            <div
                className={`cui-h-[1px] cui-w-full cui-bg-black dark:cui-bg-white ${className?.divider}`}
            />
            <div className="cui-flex cui-w-full cui-h-96 cui-justify-center cui-items-center">
                {sortedTokens.length > 0 ? (
                    <ul className="cui-list-none cui-w-full cui-h-full cui-overflow-y-auto cui-scrollbar">
                        {sortedTokens.map((token, index) => {
                            const { chainId, address, symbol, name, logoURI } =
                                token;
                            const defaultLogoSrc = getDefaultERC20TokenLogoURL(
                                chainId,
                                address
                            );
                            const selected =
                                !!selectedToken &&
                                chainId === selectedToken.chainId &&
                                address === selectedToken.address;
                            return (
                                <li
                                    key={address}
                                    className={tokenItemStyles({ selected })}
                                    data-index={index}
                                    onClick={handleTokenClick}
                                >
                                    <RemoteLogo
                                        src={logoURI}
                                        defaultSrcs={defaultLogoSrc}
                                        defaultText={symbol}
                                        ipfsGatewayURL={ipfsGatewayURL}
                                        className={{
                                            root: "cui-pointer-events-none",
                                        }}
                                    />
                                    <div className="cui-flex cui-flex-col cui-ml-3 cui-pointer-events-none">
                                        <TextMono>{symbol}</TextMono>
                                        <TextMono
                                            size="xs"
                                            className={{
                                                root: "cui-text-gray-600 dark:cui-text-gray-200",
                                            }}
                                        >
                                            {name}
                                        </TextMono>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <TextMono>Nothing</TextMono>
                )}
            </div>
            <div
                className={`cui-h-[1px] cui-w-full cui-bg-black dark:cui-bg-white ${className?.divider}`}
            />
            {!!lists && lists.length > 0 && (
                <div className="cui-p-3">
                    <Button
                        className={{
                            root: "cui-w-full",
                            ...className?.manageListsButton,
                        }}
                        onClick={onManageLists}
                    >
                        Manage token lists
                    </Button>
                </div>
            )}
        </div>
    );
};
