import type { i18n } from "i18next";

export interface TemplateBundle {
    [language: string]: { [key: string]: string };
}

export const addBundleForTemplate = (
    i18n: i18n,
    namespace: string,
    bundle: TemplateBundle
) => {
    Object.entries(bundle).forEach(([language, keys]) => {
        i18n.addResourceBundle(language, namespace, keys);
    });
};
