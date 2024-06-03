const deploymentType = import.meta.env.VITE_DEPLOYMENT_TYPE
const getApiUrlRoot = (deploymentType: string) => {
    if (deploymentType === "development") {
        return "/api"
    }
    return "https://api.whatsthemeta.net/api"
}
const urlRoot = getApiUrlRoot(deploymentType)
export const fetch_json = async (url) => {
    const response = await fetch(url);
    const json = await response.json();
    return json;
};

export const fetchMetaData = async (mode: "standard" | "eternal") => {
    const resource = "meta"
    const url = `${urlRoot}/${resource}?mode=${mode}`
    console.log("polar", { url })
    return await fetch_json(url);
}