import Color from "colorjs.io"
import {clamp, scale, rescale} from "../utils/math"


const green = new Color("hsl", [115, 54, 76])
const teal = new Color("hsl", [189, 71, 73])
const greenTealRange = green.range(teal)

const edgeColorMapper = (ele: any) => {
    //scaling winrate from 0.55 to .8
    const MIN = 0.55
    const MAX = 0.8

    const winRate = ele.data().win_rate
    const clampedWinRate = clamp(winRate, MIN, MAX)
    const linearVal = scale(clampedWinRate, MIN, MAX)

    const ans =  greenTealRange(linearVal).to("hsl").toString(
        {format: {
            name: "hsl",
                commas: true,
                coords: [
                    "<number>[0, 360]",
                    "<percentage>",
                    "<percentage>"
                ]

            }}
    )
    return ans
}

const getNodeSize = (node: any) => {
    const games_played = node.data().games_played
    return  rescale(games_played, {min: 500, max: 5000}, {min: 5, max: 50})
}

const scaleArrowSizeByWinrate  = (edge: any) => {
    const winRate = edge.data().win_rate
    const scale = rescale(winRate, {min: 0.55, max: 0.8}, {min: 0.1, max: 1})
    return scale
}

const handleNodeOutLine = (node: any): string => {
    console.log("polar handling outline", node.data())
    return node.data().selected ? "#f5c2e7" : "#cba6f7"
}
export const style =  [
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
            'background-color': 'gold',
            'border-color': handleNodeOutLine,
            'background-fit': "cover",
            'border-width': '1',
            'color': 'darkred',
            "background-image": "data(imageUrl)"
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'text-background-opacity': '1',
            'text-background-padding': '3',
            'width': scaleArrowSizeByWinrate,
            'target-arrow-shape': 'triangle',
            'line-color': ele => edgeColorMapper(ele),
            'target-arrow-color': function ( ele ) {
                return edgeColorMapper(ele);
            },
            'arrow-scale': scaleArrowSizeByWinrate,
            'font-weight': 'bold'
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
    }
]

