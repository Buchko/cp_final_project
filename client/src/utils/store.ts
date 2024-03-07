import {writable} from "svelte/store";
import cytoscape from "cytoscape";

const cy = cytoscape()
export const winrateThreshold = writable(0.50);
//can't type this propertly, but the type is a cytoscape collection
const initialNodes: string[] = []
export const selectedNodesList = writable(initialNodes)
export const showLosingMatchups = writable(false)

export const zoom = writable(1)
