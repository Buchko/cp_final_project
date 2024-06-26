import Color from "colorjs.io"
import {clamp, scale, rescale, remToPx} from "../utils/math"
import {pipe} from "rambda"


const green = new Color("hsl", [115, 54, 76])
const teal = new Color("hsl", [189, 71, 73])
const yellow = new Color("hsl", [41, 86, 83])
const red = new Color("hsl", [343, 81, 75])

const greenTealRange = green.range(teal)
const yellowRedRange = yellow.range(red)

const edgeColorMapper = (ele: any) => {
    //scaling winrate from 0.55 to .8
    const MIN = 0.50
    const MAX = 0.7

    const {win_rate: winRate, losing} = ele.data()
    const clampedWinRate = clamp(winRate, MIN, MAX)
    const linearVal = scale(clampedWinRate, MIN, MAX)
    const colorRange = losing ? yellowRedRange : greenTealRange

    const ans = colorRange(linearVal).to("hsl").toString(
        {
            format: {
                name: "hsl",
                commas: true,
                coords: [
                    "<number>[0, 360]",
                    "<percentage>",
                    "<percentage>"
                ]
            }
        }
    )
    return ans
}

export const getNodeSize = (node: any) => {
    const games_played = node.data().games_played
    const ans = pipe((x) => rescale(x, {min: 500, max: 5000}, {min: 2.5, max: 6}), remToPx)(games_played)
    return ans
}

const scaleArrowSizeByWinrate = (edge: any) => {
    const winRate = edge.data().win_rate
    const scale = rescale(winRate, {min: 0.50, max: 0.8}, {min: 0.2, max: 2})
    if (scale <= 0) {
    }
    return scale
}

const handleNodeOutlineColor = (node: any): string => {
    return node.data().selected ? "#f38ba8" : "#cba6f7"
}

const handleNodeOutlineWidth = (node: any): number => {
    return node.data().selected ? 3 : 1.5
}

const getImgUrl = (node) => {
    const {id} = node.data()
    return `https://wtm-assets-dev.s3.us-west-2.amazonaws.com/champion-icons/${id}.webp`
}

const parsePercentage = (node: any) => {
    const {win_rate: winRate} = node.data()
    return (winRate * 100).toFixed(1) + "%"
}
export const style = [
    {
        selector: 'node',
        style: {
            'width': getNodeSize,
            'height': getNodeSize,
            'font-size': '18',
            'font-weight': 'bold',
            // 'content': `data(label)`,
            'text-valign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '140',
            'border-color': handleNodeOutlineColor,
            'background-fit': "cover",
            'border-width': handleNodeOutlineWidth,
            'background-opacity': 1,
            "background-color": "#1d232a"
            // "background-image": getImgUrl
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'text-background-opacity': '0.4',
            'text-background-padding': '3',
            'width': scaleArrowSizeByWinrate,
            'target-arrow-shape': 'triangle',
            'line-color': edgeColorMapper,
            'target-arrow-color': edgeColorMapper,
            'arrow-scale': scaleArrowSizeByWinrate,
            'text-background-color': 'black',
            'text-background-shape': 'round-rectangle',
            "color": edgeColorMapper,
            "font-size": "10",
        }
    },
    {
        selector: 'edge.hovered',
        style: {
            "label": parsePercentage
        }
    },
    {
        selector: 'edge[label]',
        style: {
            'content': `data(label)`,
        }
    },
    {
        selector: 'edge.label',
        style: {
            'line-color': 'orange',
            'target-arrow-color': 'orange'
        }
    },
    {
        selector: 'node.hovered',
        style: {
            'border-width': node => 2 * handleNodeOutlineWidth(node),
        }
    },
]

