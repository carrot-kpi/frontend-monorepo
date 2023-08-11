const path = require("path");
module.exports = {
    stories: ["../stories/*.stories.@(ts|tsx)"],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        {
            name: "@storybook/addon-styling",
            options: {
                postCss: true,
            },
        },
    ],
    framework: "@storybook/react-webpack5",
    typescript: { reactDocgen: "react-docgen-typescript" },
    core: {
        disableTelemetry: true,
    },
    docs: {
        autodocs: false,
    },
    staticDirs: ["../public"],
    webpackFinal: async (config) => {
        // make tailwind work
        config.module.rules.push({
            test: /\.css$/,
            use: [
                {
                    loader: "postcss-loader",
                    options: {
                        postcssOptions: {
                            plugins: {
                                tailwindcss: {
                                    config: path.resolve(
                                        __dirname,
                                        "../src/tailwind.config.js",
                                    ),
                                },
                                autoprefixer: {},
                            },
                        },
                    },
                },
            ],
            include: path.resolve(__dirname, "../"),
        });
        return config;
    },
};
