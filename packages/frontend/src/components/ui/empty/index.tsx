import { Typography, TypographyProps } from "@carrot-kpi/ui";
import { cva, cx } from "class-variance-authority";
import React from "react";
import { useTranslation } from "react-i18next";
import { ReactComponent as EmptyIllustration } from "../../../assets/empty.svg";

const rootStyles = cva(["flex", "items-center", "gap-10"], {
    variants: {
        vertical: {
            true: ["flex-col justify-center text-center"],
        },
    },
});

interface EmptyProps {
    vertical?: boolean;
    titleVariant?: TypographyProps["variant"];
    descriptionVariant?: TypographyProps["variant"];
    className?: {
        root?: string;
        icon?: string;
    };
}

export const Empty = ({
    vertical,
    titleVariant,
    descriptionVariant,
    className,
}: EmptyProps) => {
    const { t } = useTranslation();

    return (
        <div className={rootStyles({ vertical, className: className?.root })}>
            <EmptyIllustration
                className={cx("h-50 text-gray-500", className?.icon)}
            />
            <div className="flex flex-col gap-6">
                <Typography variant={titleVariant || "h3"}>
                    {t("empty.title")}
                </Typography>
                <Typography variant={descriptionVariant || "lg"}>
                    {t("empty.description")}
                </Typography>
            </div>
        </div>
    );
};