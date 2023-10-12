import React from "react";
import type { SVGIcon } from "./types";

const Loader = (props: SVGIcon) => (
    <svg
        width="157"
        height="157"
        viewBox="0 0 157 157"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle
            cx="78.6484"
            cy="78.3491"
            r="78"
            fill="currentColor"
            opacity="0.5"
        />
        <path
            d="M107.707 59.7208L100.159 50.169C99.6077 49.4588 98.9146 48.8811 98.1271 48.4758C97.3397 48.0705 96.4767 47.8474 95.5979 47.8218C94.7165 47.8024 93.8411 47.9752 93.0283 48.329C92.2155 48.6828 91.4836 49.2097 90.8799 49.8756L46.657 98.7758C46.1086 99.3804 45.8032 100.179 45.8032 101.009C45.8032 101.839 46.1086 102.637 46.657 103.242C46.95 103.637 47.3263 103.956 47.7571 104.177C48.1878 104.397 48.6615 104.512 49.1418 104.513C49.7103 104.53 50.2733 104.395 50.7774 104.122L67.762 93.3316C68.1783 93.1647 68.5785 92.9573 68.9572 92.7122L106.135 69.2075C106.879 68.7265 107.519 68.0894 108.012 67.337C108.504 66.5847 108.84 65.7338 108.997 64.8391C109.139 63.9399 109.097 63.0199 108.875 62.1383C108.653 61.2567 108.255 60.4332 107.707 59.7208Z"
            fill="currentColor"
            opacity="0.6"
        />
    </svg>
);

export default Loader;
