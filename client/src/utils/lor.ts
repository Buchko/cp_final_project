export const getChampionImageUrl = (championCode: string) => {
    return `https://wtm-assets-dev.s3.us-west-2.amazonaws.com/champion-icons/${championCode}.webp`
}

export const getRestOfChampionImages = (node) => {
    let champions = node.assets.champions
    const restOfChampions = champions.slice(1)
    const championCodes = restOfChampions.map(champion => champion[1])
    return championCodes.map(code => getChampionImageUrl(code))
}

export const addFirstChampionImage = (nodes: any) => {
    const getChampionCode = (node) => {
        try {
            return node.data.assets.champions[0][1]
        } catch (e) {
            return null
        }
    }


    for (const node of nodes) {
        node.data.imageUrl = getChampionImageUrl(getChampionCode(node))
    }
    return nodes
}