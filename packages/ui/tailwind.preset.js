/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class", '[class~="dark"]'],
    theme: {
        fontFamily: {
            sans: [
                "Helvetica",
                "ui-sans-serif",
                "system-ui",
                "Arial",
                "sans-serif",
            ],
            mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular"],
        },
        colors: {
            // primary
            orange: "#EF692B",
            green: "#6CFF95",
            // secondary
            "orange-dark": "#D6602A",
            "green-dark": "#359650",
            yellow: "#F6FB18",
            "sky-blue": "#22BDD5",
            blue: "#0029FF",
            magenta: "#CF2CF6",
            pink: "#EA33A8",
            red: "#EA392A",
            // neutrals
            transparent: "transparent",
            current: "currentColor",
            white: "#ffffff",
            black: "#000000",
            "gray-700": "#272727",
            "gray-600": "#616161",
            "gray-500": "#828282",
            "gray-400": "#B3B3B3",
            "gray-300": "#CBCBCB",
            "gray-200": "#E9E9E9",
            "gray-100": "#F6F6F6",
        },
        extend: {
            borderRadius: {
                xxs: "10px",
                xxl: "15px",
            },
            backgroundSize: {
                4: "4rem",
                2: "2rem",
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
