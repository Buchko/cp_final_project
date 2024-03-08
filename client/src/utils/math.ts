export const clamp =(x: number, min: number, max:number): number =>  {
    return Math.min(Math.max(x, min), max)
}
export const scale = (x: number, min: number, max: number) => {
    return  (x - min) / (max - min)
}

export const rescale =  (x, start: {min: number, max: number}, end: {min: number, max: number}) => {
    const distance = scale(x, start.min, start.max)
    return end.min + (end.max - end.min) * distance
}

export const remToPx = (rem: number): number  => {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const zip = (a: any[], b: any[]) => {
    return a.map((ele, i) => [ele, b[i]])
}

export const weightedAverage =(weights: number[], items: number[]) => {
    const zipped = zip(weights, items)
    const numerator = zipped.map(ele => {
        const [weight, item] = ele
        return weight * item
    }).reduce((sum, ele) => sum + ele, 0)
    const denominator = weights.reduce((sum, curr) => sum + curr, 0)
    return numerator / denominator
}