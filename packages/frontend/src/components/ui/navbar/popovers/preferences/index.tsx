import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Popover,
    Select,
    SelectOption,
    Switch,
    Typography,
} from "@carrot-kpi/ui";
import { forwardRef } from "react";
import {
    usePreferDecentralization,
    useSetPreferDecentralization,
} from "@carrot-kpi/react";
import { useTranslation } from "react-i18next";
import { InfoPopover } from "../../../../info-popover";

interface PreferencesPopoverProps {
    open: boolean;
    anchor?: HTMLElement | null;
}

// TODO: move this in the UI lib with additional functionality (like variants for info, warning and error feedback)
export const PreferencesPopover = forwardRef<
    HTMLDivElement,
    PreferencesPopoverProps
>(function PreferencesPopover({ open, anchor }, ref) {
    const { t } = useTranslation();
    const preferDecentralization = usePreferDecentralization();
    const setPreferDecentralization = useSetPreferDecentralization();
    const darkThemeSwitchRef = useRef<HTMLDivElement>(null);
    const themeOptions = useMemo(() => {
        const options: SelectOption[] = [
            {
                value: "light",
                label: t("theme.light"),
            },
            {
                value: "dark",
                label: t("theme.dark"),
            },
            {
                value: "system",
                label: t("theme.system"),
            },
        ];
        return options;
    }, [t]);

    const [darkThemePopoverOpen, setDarkThemePopoverOpen] = useState(false);

    const handleDarkThemeSwitchMouseEnter = useCallback(() => {
        setDarkThemePopoverOpen(true);
    }, []);

    const handleDarkThemeSwitchMouseLeave = useCallback(() => {
        setDarkThemePopoverOpen(false);
    }, []);

    return (
        <Popover
            open={open}
            anchor={anchor}
            ref={ref}
            className={{ root: "px-6 py-7 flex flex-col gap-4 text-center" }}
            placement="bottom-end"
        >
            <Typography variant="md" uppercase weight="medium">
                {t("preferences.title")}
            </Typography>
            <div className="flex justify-between gap-20 items-center">
                <Typography>{t("preferences.theme")}</Typography>
                <Popover
                    className={{ root: "p-2" }}
                    anchor={darkThemeSwitchRef.current}
                    open={darkThemePopoverOpen}
                >
                    <Typography>{t("coming.soon.dark.theme")}</Typography>
                </Popover>
                <div
                    onMouseEnter={handleDarkThemeSwitchMouseEnter}
                    onMouseLeave={handleDarkThemeSwitchMouseLeave}
                    ref={darkThemeSwitchRef}
                >
                    <Select
                        id="theme-select"
                        disabled
                        options={themeOptions}
                        value={
                            themeOptions.find(
                                (option) => option.value === "light"
                            ) || null
                        }
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        onChange={() => {}}
                        className={{
                            root: "opacity-50",
                            inputWrapper: "w-32",
                            input: "w-32",
                        }}
                    />
                </div>
            </div>
            {!__PREVIEW_MODE__ && (
                <div className="flex justify-between gap-20 items-center">
                    <div className="flex gap-2 items-center">
                        <Typography>
                            {t("preferences.decentralization")}
                        </Typography>
                        <InfoPopover>
                            <Typography
                                variant="sm"
                                className={{ root: "max-w-md" }}
                            >
                                {t("preferences.decentralization.info")}
                            </Typography>
                        </InfoPopover>
                    </div>
                    <Switch
                        checked={preferDecentralization}
                        onChange={setPreferDecentralization}
                    />
                </div>
            )}
        </Popover>
    );
});
