import { Button, Typography } from "@carrot-kpi/ui";
import React from "react";
import { FeaturedCampaings } from "../../../components/featured-campaigns";
import { CardHorizontal } from "../../../components/ui/cards-horizontal";
import { DXdaoSideLink } from "./DXdaoSideLink";
import { Link } from "react-router-dom";
import { ReactComponent as Plus } from "../../../assets/plus.svg";
import { useTranslation } from "react-i18next";
import { cva } from "class-variance-authority";
import { CreateCampaignButton } from "../../../components/create-campaign-button";

const plusIconStyles = cva(["invisible", "md:visible", "absolute"], {
    variants: {
        x: {
            left: ["left-4"],
            right: ["right-4"],
        },
        y: {
            top: ["top-10"],
            middle: ["top-1/3"],
            bottom: ["bottom-10"],
        },
    },
});

export const Hero = () => {
    const { t } = useTranslation();

    return (
        <div className="relative bg-orange bg-grid-light">
            <div className="relative space-y-12 pt-7 pb-16 md:pt-24 md:pb-32">
                <Typography
                    variant="h1"
                    className={{
                        root: "px-6 md:px-10 lg:px-32 dark:text-black",
                    }}
                >
                    {t("home.featuredCampaigns")}
                </Typography>
                <CardHorizontal className="px-6 md:px-10 lg:px-32 dark">
                    <FeaturedCampaings />
                </CardHorizontal>
                <div className="px-6 md:px-10 lg:px-32 flex flex-col space-x-0 md:space-x-8 space-y-4 md:space-y-0 md:flex-row">
                    <Button variant="primary" size="big">
                        <Link to="/campaigns">{t("campaign.all")}</Link>
                    </Button>
                    <CreateCampaignButton />
                </div>
            </div>
            <div className="absolute invisible left-4 top-1/3 lg:visible ">
                <DXdaoSideLink />
            </div>
            <Plus className={plusIconStyles({ y: "top", x: "left" })} />
            <Plus className={plusIconStyles({ y: "top", x: "right" })} />
            <Plus className={plusIconStyles({ y: "bottom", x: "left" })} />
            <Plus className={plusIconStyles({ y: "bottom", x: "right" })} />
        </div>
    );
};
