export const testFetch = async () => {
    const url = "/api";
    const response = await fetch(url);
    const text = await response.text();
    console.log("polar response", text);
};

export const fetch_json = async (url) => {
    const response = await fetch(url);
    const json = await response.json();
    return json;
};

export const fetchMetaData = async (mode: "standard" | "eternal") => {
    const url = `api/meta?mode=${mode}`;
    return await fetch_json(url);
}