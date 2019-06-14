export interface Color {
    r:number,
    g:number,
    b:number,
    a:number
}

export interface Color {
    r:number,
    g:number,
    b:number,
    a:number
}

export let makeFloatColor = (r:number,g:number,b:number,a:number = 1):Color => {
    return {r,g,b,a}
}


export let makeRGBColor = (r:number,g:number,b:number,a:number = 255):Color => {
    return {r,g,b,a}
}

export let rgbToFloatColor = ({r,g,b,a}:Color) => {
    return {r: r/255, g: g/255, b: b/255, a: a/255}    
}

export let Colors = {
    WHITE: makeRGBColor(255,255,255),
    RED: makeRGBColor(255,0,0),
    GREEN: makeRGBColor(0,255,0),
    BLUE: makeRGBColor(0,0,255),
    YELLOW: makeRGBColor(255,255,0),
    PURPLE: makeRGBColor(128,0,128),

    ELECTRIC_INDIGO: makeRGBColor(140, 20, 252, 1)
}