const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

import {createClient} from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey)

async function convertBlobToObject(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const jsonString = event.target.result;
                const jsonObject = JSON.parse(jsonString);
                resolve(jsonObject);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsText(blob);
    });
}

export const fetchGraphData = async (mode: "eternal" | "standard") => {
    const keys = [`${mode}-nodes.json`, `${mode}-edges.json`]
    const fetchData = async (key: string, bucketName: string) => {
        const {data, error} = await supabase.storage.from(bucketName).download(key)
        const processedData = await convertBlobToObject(data)
        return processedData
    }
    const promises = keys.map(key => fetchData(key, "lor-meta"))
    let [nodes, edges] = await Promise.all(promises)
    return [nodes, edges]
}