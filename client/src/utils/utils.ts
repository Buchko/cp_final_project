export const displayPercentage  = (x: number) => {
    const rounded = (x * 100).toFixed(2)
    return rounded + "%"
}