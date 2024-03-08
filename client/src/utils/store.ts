import {writable} from "svelte/store";
import cytoscape from "cytoscape";

const cy = cytoscape()
export const winrateThreshold = writable(0.50);
//can't type this propertly, but the type is a cytoscape collection
const initialNodes: string[] = []
export const selectedNodesList = writable(initialNodes)
export const showLosingMatchups = writable(false)

export const zoom = writable(1)
export const storeNodes = writable(undefined)
export const storeEdges = writable(undefined)
export const storeSelectedNodes = writable(undefined)
export const storeWinningNodes = writable(undefined)
export const totalGamesPlayed = writable(0)