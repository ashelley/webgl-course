export let subtract2d = (p0:{x:number,y:number}, p1:{x:number, y:number}) => {
    return {x: p0.x - p1.x, y: p0.y - p1.y} 
}

export let subtract3d = (p0:{x:number,y:number,z:number}, p1:{x:number, y:number,z:number}) => {
    return {x: p0.x - p1.x, y: p0.y - p1.y, z: p0.z - p1.z} 
}

export let length3d = (v:{x:number,y:number,z:number}) => {
    return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z + v.z))
}

export let add2d = (p0:{x:number,y:number}, p1:{x:number,y:number}) => {
    return {x: p0.x + p1.x, y: p0.y + p1.y} 
}

export let multiply2d = (p0:{x:number,y:number}, p1:{x:number,y:number}) => {
    return {x: p0.x * p1.x, y: p0.y * p1.y} 
}

export let multiply3d = (p0:{x:number,y:number,z:number}, p1:{x:number,y:number,z:number}) => {
    return {x: p0.x * p1.x, y: p0.y * p1.y, z: p0.z * p1.z} 
}

export let multiply2dToScalar = (p0:{x:number,y:number}, scalar:number) => {
    return {x: p0.x * scalar, y: p0.y * scalar} 
}

export let normalize = (v:{x:number,y:number,z:number}) => {
    let length = length3d(v)
    let x = v.x / length
    let y = v.y / length
    let z = v.z / length
    v.x = x
    v.y = y
    v.z = z
}

export let dot = (a:{x:number,y:number,z:number},b:{x:number,y:number,z:number}) => {
    return (a.x * b.x) + (a.y * b.y) + (a.z * b.z)
}