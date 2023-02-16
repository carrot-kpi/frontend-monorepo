import React, { useCallback, useEffect, useState } from "react";
import {
    Route,
    Routes,
    useLocation,
    matchPath,
    Location,
    useNavigate,
} from "react-router-dom";
import { Home } from "../home";
import { Page } from "../page";
import { Create } from "../create";
import { Campaigns } from "../campaigns";
import { CreateWithTemplateId } from "../create-with-template-id";
import { usePreviousDistinct } from "react-use";
import { usePreferencesSetters } from "@carrot-kpi/react";

const CREATE_ROUTE_PATH = { path: "/create/:templateId", key: "create" };
const PAGE_ROUTE_PATH = { path: "/campaigns/:address", key: "page" };

const MODAL_ROUTE_PATHS = [CREATE_ROUTE_PATH, PAGE_ROUTE_PATH];

const DEFAULT_LOCATION = {
    pathname: "/",
    state: undefined,
    key: "",
    search: "",
    hash: "",
};

interface AppProps {
    customBaseURL?: string;
    templateId?: number;
}

export const App = ({ customBaseURL, templateId }: AppProps) => {
    const location = useLocation();
    const previousLocation = usePreviousDistinct(location);
    const navigate = useNavigate();
    const { setPreferDecentralization } = usePreferencesSetters();

    useEffect(() => {
        if (__PREVIEW_MODE__) setPreferDecentralization(true);
    }, [setPreferDecentralization]);

    const [modalLocation, setModalLocation] = useState<Location | undefined>();
    const [closingModalId, setClosingModalId] = useState("");
    const [mainLocation, setMainLocation] = useState(location);

    useEffect(() => {
        // detect modal opening and setup. If the previous distinct
        // location was not a modal route, and the current one is,
        // the previous location is set as the main route to prevent
        // the modal background from unmounting, while the new location
        // is set as the modals one in order to correctly mount the
        // component with animations etc etc.
        const openingModal = MODAL_ROUTE_PATHS.find(({ path }) =>
            matchPath({ path }, location.pathname)
        );
        if (openingModal) {
            // in case previous location is not there (fr example when
            // coming in through an external link), set the homepage as
            // the main location
            document.documentElement.classList.add("overflow-hidden");
            setMainLocation(previousLocation || DEFAULT_LOCATION);
            setModalLocation(location);
            return;
        }

        // detect modal closing and teardown. If the previous distinct
        // location was a modal route, and the current one isn't,
        // the scroll is re-enabled. Once the animation is finished the
        // onOutAnimationEnd will be called and navigate will take care
        // of route reconciliation.
        if (previousLocation) {
            for (let i = 0; i < MODAL_ROUTE_PATHS.length; i++) {
                const { path } = MODAL_ROUTE_PATHS[i];
                if (matchPath({ path }, previousLocation.pathname)) {
                    document.documentElement.classList.remove(
                        "overflow-hidden"
                    );
                    break;
                }
            }
        }

        // if not coming from a modal or going to one, scroll to top on
        // distinct main location changes
        if (!location.state?.navigatingAwayFromModal) {
            setMainLocation(location);
            window.scroll({ top: 0, left: 0 });
        }
    }, [location, mainLocation, modalLocation, previousLocation]);

    const handleAnimationEnd = useCallback(() => {
        setClosingModalId("");
        setModalLocation(undefined);
        navigate(mainLocation, { state: { navigatingAwayFromModal: true } });
    }, [mainLocation, navigate]);

    return (
        <>
            <Routes location={mainLocation}>
                <Route path="/" element={<Home templateId={templateId} />} />
                <Route path="/create" element={<Create />} />
                <Route path="/campaigns" element={<Campaigns />} />
            </Routes>
            {modalLocation && (
                <Routes location={modalLocation}>
                    <Route
                        path={CREATE_ROUTE_PATH.path}
                        element={
                            <CreateWithTemplateId
                                customBaseURL={customBaseURL}
                                closing={
                                    closingModalId === CREATE_ROUTE_PATH.key
                                }
                                onOutAnimationEnd={handleAnimationEnd}
                            />
                        }
                    />
                    <Route
                        path={PAGE_ROUTE_PATH.path}
                        element={
                            <Page
                                customBaseURL={customBaseURL}
                                closing={closingModalId === PAGE_ROUTE_PATH.key}
                                onOutAnimationEnd={handleAnimationEnd}
                            />
                        }
                    />
                </Routes>
            )}
        </>
    );
};
