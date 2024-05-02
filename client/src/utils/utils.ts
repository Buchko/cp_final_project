export const displayPercentage  = (x: number) => {
    const rounded = (x * 100).toFixed(2)
    return rounded + "%"
}
export const buildStyleString = (styleObject: Object) => {
    return Object.entries(styleObject).map(([key, value]) => `${key}:${value}`)
        .join(';');
}