import catalog from "@/data/bikeCatalog.json";

export const getMakes = () => Object.keys(catalog);
export const getModels = (make) => (make && catalog[make]) ? Object.keys(catalog[make]) : [];
export const getModelDef = (make, model) => (catalog[make] && catalog[make][model]) || null;
export const getSpecFields = (make, model) => getModelDef(make, model)?.specs || [];
export const getFeatureFields = (make, model) => getModelDef(make, model)?.features || [];
export const getYears = (make, model) => getModelDef(make, model)?.years || [];
export const getCatalogVersion = () => catalog.version || 1;
