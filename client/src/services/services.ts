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
    const urls = [`/api/meta/${mode}/edges`, `/api/meta/${mode}/nodes`];
    const promises = urls.map((url) => fetch_json(url));
    const responses = await Promise.all(promises);
    console.log("polar", { responses });

    const edges = responses[0];
    const nodes = responses[1];
    return { nodes, edges };
};
