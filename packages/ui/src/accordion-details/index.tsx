import { cva } from "class-variance-authority";
import React, { ReactElement } from "react";

interface DetailsProps {
    className?: string;
    children: ReactElement;
}

const accordionDetailsStyles = cva(["cui-p-3"], { variants: {} });

export const AccordionDetails = ({
    className,
    children,
    ...rest
}: DetailsProps): ReactElement => (
    <div {...rest} className={accordionDetailsStyles({ className })}>
        {children}
    </div>
);
