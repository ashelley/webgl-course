export let subtract2d = (p0:{x:number,y:number}, p1:{x:number, y:number}) => {
    return {x: p0.x - p1.x, y: p0.y - p1.y} 
}

export let add2d = (p0:{x:number,y:number}, p1:{x:number,y:number}) => {
    return {x: p0.x + p1.x, y: p0.y + p1.y} 
}

export let multiply2d = (p0:{x:number,y:number}, p1:{x:number,y:number}) => {
    return {x: p0.x * p1.x, y: p0.y * p1.y} 
}

export let multiply2dToScalar = (p0:{x:number,y:number}, scalar:number) => {
    return {x: p0.x * scalar, y: p0.y * scalar} 
}