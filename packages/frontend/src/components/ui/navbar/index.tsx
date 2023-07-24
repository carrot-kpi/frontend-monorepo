import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../../../icons/logo";
import { cva } from "class-variance-authority";
import MenuIcon from "../../../icons/menu";
import { ConnectWallet } from "../../connect-wallet";
import X from "../../../icons/x";
import SettingsIcon from "../../../icons/settings";
import { Button } from "@carrot-kpi/ui";
import { PreferencesPopover } from "./popovers/preferences";
import { useClickAway } from "react-use";
import { NavbarVerticalLayout } from "./vertical-layout";
import type { NavbarLink } from "../../../constants";

const navWrapperStyles = cva([], {
    variants: {
        bgColor: {
            green: ["bg-green"],
            orange: ["bg-orange"],
        },
    },
});

const navbarStyles = cva(
    [
        "relative flex flex-row-reverse md:flex-row items-center justify-between py-5 md:py-8 xl:py-11",
    ],
    {
        variants: {
            bgColor: {
                green: ["bg-green"],
                orange: ["bg-orange"],
            },
            mode: {
                standard: ["px-6 xl:px-32"],
                modal: ["px-6 xl:px-10"],
            },
        },
    },
);

export interface NavbarProps {
    bgColor?: "green" | "orange";
    mode?: "standard" | "modal";
    onDismiss?: () => void;
    links?: NavbarLink[];
}

export const Navbar = ({
    bgColor,
    mode = "standard",
    onDismiss,
    links = [],
}: NavbarProps) => {
    const [preferencesAnchor, setPreferencesAnchor] =
        useState<HTMLButtonElement | null>(null);
    const preferencesPopoverRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [preferencesPopoverOpen, setPreferencesPopoverOpen] = useState(false);

    useClickAway(preferencesPopoverRef, () => {
        setPreferencesPopoverOpen(false);
    });

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            if (width > 640) setOpen(false);
        });

        resizeObserver.observe(document.body);
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            resizeObserver.unobserve(document.body);
        };
    });

    const handlePreferencesPopoverOpen = useCallback(() => {
        setPreferencesPopoverOpen(true);
    }, []);

    return (
        <>
            <NavbarVerticalLayout
                mode={mode}
                open={open}
                links={links}
                onNavbarClose={() => setOpen(false)}
            />
            <div className={navWrapperStyles({ bgColor })}>
                <div className={navbarStyles({ bgColor, mode })}>
                    {mode === "modal" ? (
                        <Logo className="w-32 h-auto xl:w-[188px] text-black" />
                    ) : (
                        <NavLink to="/" onClick={() => setOpen(false)}>
                            <Logo className="w-32 h-auto xl:w-[188px] text-black" />
                        </NavLink>
                    )}
                    <nav className="hidden md:flex">
                        <ul className="flex items-center space-x-8">
                            {links.map((link) => {
                                const additionalProps = link.external
                                    ? {
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                      }
                                    : {};
                                return (
                                    <li key={link.to}>
                                        <NavLink
                                            className="flex items-start space-x-2 cursor-pointer"
                                            to={link.to}
                                            onClick={() => setOpen(false)}
                                            {...additionalProps}
                                        >
                                            <span className="font-mono text-2xl xl:text-base">
                                                ↳
                                            </span>
                                            <p className="font-mono text-black text-2xl hover:underline xl:text-base uppercase underline-offset-[12px]">
                                                {link.title}
                                            </p>
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                    <div className="flex flex-row-reverse md:flex-row items-center gap-4">
                        <div className="hidden md:block">
                            <ConnectWallet />
                        </div>
                        <Button
                            ref={setPreferencesAnchor}
                            size="small"
                            onClick={handlePreferencesPopoverOpen}
                            icon={SettingsIcon}
                            className={{
                                root: "w-12 h-12 p-0 flex justify-center items-center",
                            }}
                        />
                        <PreferencesPopover
                            open={preferencesPopoverOpen}
                            anchor={preferencesAnchor}
                            ref={preferencesPopoverRef}
                        />
                        <div className="flex items-center">
                            {mode !== "modal" && (
                                <MenuIcon
                                    className="cursor-pointer md:hidden"
                                    onClick={() => setOpen(!open)}
                                />
                            )}
                            {mode === "modal" && (
                                <div
                                    className="flex items-center justify-center w-10 h-10 bg-white border border-black rounded-full cursor-pointer xl:w-16 xl:h-16"
                                    onClick={onDismiss}
                                >
                                    <X className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
