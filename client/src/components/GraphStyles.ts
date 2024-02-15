import Color from "colorjs.io"
import {clamp} from "../utils/math"


const green = new Color("hsl", [115, 54, 76])
const teal = new Color("hsl", [189, 71, 73])
const greenTealRange = green.range(teal)

const edgeColorMapper = (ele: any) => {
    const rescale = (x: number, min: number, max: number) => {
        return  (x - min) / (max - min)
    }
    //scaling winrate from 0.55 to .8
    const MIN = 0.55
    const MAX = 0.8

    console.log("polar", ele.data())
    const winRate = ele.data().win_rate
    const clampedWinRate = clamp(winRate, MIN, MAX)
    const linearVal = rescale(clampedWinRate, MIN, MAX)
    const array =  greenTealRange(linearVal).to("hsl").
    const ans = {h: array[0], s: array[1], l:array[2]}
    console.log({ winRate, clampedWinRate, linearVal, ans })
    return ans
}
export const style =  [
    {
        selector: 'node',
        style: {
            'width': '200',
            'height': '200',
            'font-size': '18',
            'font-weight': 'bold',
            // 'content': `data(label)`,
            'text-valign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '140',
            'background-color': 'gold',
            'border-color': '#f5c2e7',
            'background-fit': "cover",
            'border-width': '3',
            'color': 'darkred',
            "background-image": "data(imageUrl)"
        }
    },
    {
        selector: 'node:selected',
        style: {
            'background-color': 'darkred',
            color: 'white',
            'border-color': 'darkred',
            'line-color': '#0e76ba',
            'target-arrow-color': '#0e76ba'
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'text-background-opacity': '1',
            'text-background-padding': '3',
            'width': '3',
            'target-arrow-shape': 'triangle',
            'line-color': 'hsl(41.01, 86.321%, 83%)',
            'target-arrow-color': function ( ele ) {
                return edgeColorMapper(ele);
            },
            'arrow-scale': 4,
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

