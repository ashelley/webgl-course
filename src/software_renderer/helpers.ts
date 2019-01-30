export interface Color {
    r:number,
    g:number,
    b:number,
    a:number
}

export interface Point {
    x:number,
    y:number
}

export let makeColor = (r:number,g:number,b:number,a:number = 255) => {
    return {r,g,b,a}
}

export let Colors = {
    WHITE: makeColor(255,255,255),
    RED: makeColor(255,0,0),
    GREEN: makeColor(0,255,0),
    BLUE: makeColor(0,0,255)
}

export let makePoint = (x:number,y:number) => {
    return {x,y}
}

export let swapPoint = (p:Point) => {
    let x = p.x
    p.x = p.y
    p.y = x
}

export let abs = Math.abs
export let int = Math.floor