import { test as base, chromium, type BrowserContext } from "@playwright/test";
import { initialSetup } from "@synthetixio/synpress/commands/metamask";
import { setExpectInstance } from "@synthetixio/synpress/commands/playwright";
import { resetState } from "@synthetixio/synpress/commands/synpress";
import { prepareMetamask } from "@synthetixio/synpress/helpers";
// Page instances
import { HomePage } from "../utils/pages/homePage";
import { CreateCampaign } from "./pages/createCampaignPage";
import { CampaignPage } from "./pages/campaignPage";

/**
 * @exports context fixture which sets up Metamask extension before test start
 * @exports page instances used in tests
 */
export const test = base.extend<{
    context: BrowserContext;
    homePage: HomePage;
    createCampaign: CreateCampaign;
    campaignPage: CampaignPage;
}>({
    context: async ({}, use) => {
        // required for synpress as it shares same expect instance as playwright
        await setExpectInstance(expect);

        // download metamask
        const metamaskPath = await prepareMetamask(
            process.env.METAMASK_VERSION || "10.25.0",
        );

        // prepare browser args
        const browserArgs = [
            `--disable-extensions-except=${metamaskPath}`,
            `--load-extension=${metamaskPath}`,
            "--remote-debugging-port=9222",
        ];

        if (process.env.CI) browserArgs.push("--disable-gpu");
        if (process.env.HEADLESS_MODE) browserArgs.push("--headless=new");

        // launch browser
        const context = await chromium.launchPersistentContext("", {
            headless: false,
            args: browserArgs,
            viewport: { width: 1920, height: 1080 },
        });

        // wait for metamask
        await context.pages()[0].waitForTimeout(3000);

        // setup metamask
        await initialSetup(chromium, {
            secretWordsOrPrivateKey:
                "test test test test test test test test test test test junk",
            network: "Polygon Mumbai",
            password: "Tester@1234",
            enableAdvancedSettings: true,
        });

        await use(context);

        await context.close();

        await resetState();
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    createCampaign: async ({ page }, use) => {
        await use(new CreateCampaign(page));
    },
    campaignPage: async ({ page }, use) => {
        await use(new CampaignPage(page));
    },
});

export const expect = test.expect;
