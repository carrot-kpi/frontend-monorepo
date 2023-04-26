import React from "react";
import { SVGIcon } from "./types";

const Power = (props: SVGIcon) => (
    <svg
        width="17"
        height="17"
        viewBox="0 0 17 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M8.05534 1.91895V7.91895"
            stroke="currentColor"
            strokeLinecap="round"
        />
        <path
            d="M12.2973 4.34375C14.6405 6.6869 14.6405 10.4859 12.2973 12.829C9.95418 15.1722 6.15519 15.1722 3.81205 12.829C1.4689 10.4859 1.4689 6.6869 3.81205 4.34375"
            stroke="currentColor"
            strokeLinecap="round"
        />
    </svg>
);

export default Power;
