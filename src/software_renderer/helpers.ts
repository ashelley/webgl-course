import Vector2 from "../helpers/Vector2";
import Vector3 from "../helpers/Vector3";



export interface Point {
    x:number,
    y:number
}



export let makePoint = (x:number,y:number) => {
    return {x,y}
}

export let swapPointXY = (p:Point) => {
    let x = p.x
    p.x = p.y
    p.y = x
}

export let swapPoints = (p0:Point, p1:Point) => {
    let x = p0.x
    let y = p0.y
    p0.x = p1.x
    p0.y = p1.y
    p1.x = x
    p1.y = y
}

export let vec2 = (x:number, y:number) => {
    return new Vector2(x,y)
}

export let vec3 = (x:number,y:number,z:number) => {
    return new Vector3(x,y,z)
}

export let vec3i = (x:number,y:number,z:number) => {
    return new Vector3(Math.floor(x),Math.floor(y),Math.floor(z))
}

export let sortPointByY = (p0:Point, p1: Point) => {
    if(p0.y > p1.y) {
        swapPoints(p0, p1)
    }
}

export let sortPointByX = (p0:Point, p1: Point) => {
    if(p0.x > p1.x) {
        swapPoints(p0, p1)
    }
}


