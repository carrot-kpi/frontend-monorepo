import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ReactComponent as Logo } from "../../../assets/logo.svg";
import { cva } from "class-variance-authority";
import { ReactComponent as CloseIcon } from "../../../assets/x.svg";
import { ReactComponent as MenuIcon } from "../../../assets/menu.svg";
import { GridPatternBg } from "../grid-pattern-bg";
import { ConnectWallet } from "../../connect-wallet";
import { ReactComponent as X } from "../../../assets/x.svg";

const navWrapperStyles = cva([""], {
    variants: {
        bgColor: {
            green: ["bg-green"],
            orange: ["bg-orange"],
        },
        isOpen: {
            true: ["fixed top-0 left-0 z-10 h-screen w-full"],
        },
    },
});

const navbarStyles = cva(
    ["relative flex items-center justify-between py-8 md:py-11"],
    {
        variants: {
            bgColor: {
                green: ["bg-green"],
                orange: ["bg-orange"],
            },
            isOpen: {
                true: ["z-10"],
            },
            mode: {
                standard: ["px-6 lg:px-32"],
                modal: ["px-6 lg:px-10"],
            },
        },
    }
);

const navStyles = cva([], {
    variants: {
        isOpen: {
            true: ["absolute flex flex-col top-28 left-0 px-6 py-16  w-full"],
            false: ["hidden md:flex"],
        },
    },
});

const navLinksStyles = cva(["flex"], {
    variants: {
        isOpen: {
            true: ["flex-col items-start space-y-8 relative"],
            false: [
                "items-center space-x-8 left-1/2 absolute transform -translate-x-1/2 -translate-y-1/2",
            ],
        },
    },
});

interface LinkProps {
    title: string;
    to: string;
}

export interface NavbarProps {
    bgColor?: "green" | "orange";
    mode?: "standard" | "modal";
    onDismiss?: () => void;
    links?: LinkProps[];
}

export const Navbar = ({
    bgColor,
    mode = "standard",
    onDismiss,
    links,
}: NavbarProps) => {
    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        const closeMenuOnResizeToDesktop = () => {
            if (window.innerWidth > 700) setOpen(false);
        };
        window.addEventListener("resize", closeMenuOnResizeToDesktop);
        return () => {
            window.removeEventListener("resize", closeMenuOnResizeToDesktop);
        };
    }, [isOpen]);

    return (
        <div className={navWrapperStyles({ isOpen, bgColor })}>
            {isOpen && <GridPatternBg className="md:hidden" />}
            <div className={navbarStyles({ bgColor, isOpen, mode })}>
                <NavLink to="/" onClick={() => setOpen(false)}>
                    <Logo className="w-32 h-auto md:w-[188px] text-black" />
                </NavLink>
                {links && (
                    <nav className={navStyles({ isOpen })}>
                        <ul className={navLinksStyles({ isOpen })}>
                            {links.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setOpen(false)}
                                >
                                    <li className="flex items-start space-x-2 cursor-pointer">
                                        <span className="font-mono text-2xl md:text-base">
                                            ↳
                                        </span>
                                        <p className="font-mono text-black text-2xl hover:underline md:text-base uppercase underline-offset-[12px]">
                                            {link.title}
                                        </p>
                                    </li>
                                </NavLink>
                            ))}
                        </ul>
                    </nav>
                )}
                <div className="flex">
                    <div
                        className={`absolute top-[420px] md:static ${
                            !isOpen && "hidden"
                        } md:block md:top-auto`}
                    >
                        <ConnectWallet />
                    </div>
                    {mode !== "modal" && (
                        <div
                            className="md:hidden"
                            onClick={() => setOpen(!isOpen)}
                        >
                            {isOpen ? <CloseIcon /> : <MenuIcon />}
                        </div>
                    )}
                    {mode === "modal" && (
                        <div
                            className="ml-10 w-16 h-16 bg-white rounded-full border border-black flex items-center justify-center cursor-pointer"
                            onClick={onDismiss}
                        >
                            <X className="w-8 h-8" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
