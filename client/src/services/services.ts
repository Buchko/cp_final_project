const deploymentType = import.meta.env.VITE_DEPLOYMENT_TYPE
const getApiUrlRoot = (deploymentType: string) => {
    const deploymentTypeLookup = new Map([
        ["development", "/api/dev/"],
        ["production", "/api/"],
    ])
    const result = deploymentTypeLookup.get(deploymentType)
    if (!result) {
        throw new Error("invalid deployment type")
    }
    return result
}
const urlRoot = getApiUrlRoot(deploymentType)
export const fetch_json = async (url) => {
    const response = await fetch(url);
    const json = await response.json();
    return json;
};

export const fetchMetaData = async (mode: "standard" | "eternal") => {
    const resource = "meta"
    const domain = "https://t2iyzpu6ll.execute-api.us-west-2.amazonaws.com/prod"
    const url = `${domain}/${urlRoot}${resource}?mode=${mode}`
    console.log("polar", { url })
    return await fetch_json(url);
}