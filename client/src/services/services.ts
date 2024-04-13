export const fetch_json = async (url) => {
    const response = await fetch(url);
    const json = await response.json();
    return json;
};

export const fetchMetaData = async (mode: "standard" | "eternal") => {
    const url = `api/meta?mode=${mode}`;
    return await fetch_json(url);
}