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
