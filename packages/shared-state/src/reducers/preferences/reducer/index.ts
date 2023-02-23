import { createReducer } from "@reduxjs/toolkit";
import {
    setKPITokenTemplateBaseURL,
    setOracleTemplateBaseURL,
    setPreferDecentralization,
    setTheme,
} from "../actions";
import { PreferencesState } from "../types";

const initialState: PreferencesState = {
    theme: "system",
    preferDecentralization: false,
    kpiTokenTemplateBaseURL: undefined,
    oracleTemplateBaseURL: undefined,
};

export const preferencesReducer = createReducer(initialState, (builder) =>
    builder
        .addCase(setTheme, (state, action) => {
            state.theme = action.payload;
        })
        .addCase(setPreferDecentralization, (state, action) => {
            state.preferDecentralization = action.payload;
        })
        .addCase(setKPITokenTemplateBaseURL, (state, action) => {
            state.kpiTokenTemplateBaseURL = action.payload;
        })
        .addCase(setOracleTemplateBaseURL, (state, action) => {
            state.oracleTemplateBaseURL = action.payload;
        })
);
