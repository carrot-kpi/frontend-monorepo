import React, { useCallback, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { DateInput as DateInputComponent, DateInputProps } from ".";

export default {
    title: "Input/DatePicker",
    component: DateInputComponent,
} as Meta<typeof DateInputComponent>;

const Component = (props: DateInputProps) => {
    const [value, setValue] = useState<Date | undefined>();

    const handleChange = useCallback((value: Date) => {
        setValue(value);
    }, []);

    return (
        <DateInputComponent {...props} value={value} onChange={handleChange} />
    );
};

export const DatePicker: StoryObj<typeof DateInputComponent> = {
    render: Component,
    args: {
        label: "Date input",
        placeholder: "Date input",
        min: new Date(),
    },
};
