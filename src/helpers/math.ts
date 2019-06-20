import Vector3 from "./Vector3";

export let abs = Math.abs
export let int = Math.floor
export let sqrt = Math.sqrt

export let subtract2d = (p0:{x:number,y:number}, p1:{x:number, y:number}) => {
    return {x: p0.x - p1.x, y: p0.y - p1.y} 
}

export let subtract3d = (p0:{x:number,y:number,z:number}, p1:{x:number, y:number,z:number}) => {
    return {x: p0.x - p1.x, y: p0.y - p1.y, z: p0.z - p1.z} 
}

export let length3d = (v:{x:number,y:number,z:number}) => {
    return sqrt(abs(v.x * v.x) + abs(v.y * v.y) + abs(v.z + v.z))
}

export let add2d = (p0:{x:number,y:number}, p1:{x:number,y:number}) => {
    return {x: p0.x + p1.x, y: p0.y + p1.y} 
}

export let add3d = (p0:{x:number,y:number,z:number}, p1:{x:number,y:number,z:number}) => {
    return {x: p0.x + p1.x, y: p0.y + p1.y, z: p0.z + p1.z} 
}

export let multiply2d = (p0:{x:number,y:number}, p1:{x:number,y:number}) => {
    return {x: p0.x * p1.x, y: p0.y * p1.y} 
}

export let multiply3d = (p0:{x:number,y:number,z:number}, p1:{x:number,y:number,z:number}) => {
    return {x: p0.x * p1.x, y: p0.y * p1.y, z: p0.z * p1.z} 
}

export let multiplyColor = (c0:{r:number,g:number,b:number},c1:{r:number,g:number,b:number}) => {
    return {r: c0.r * c1.r, g: c0.g * c1.g, b: c0.b * c1.b, a:1} 
}

export let scaleColor = (c0:{r:number,g:number,b:number},amount:number) => {
    return {r: c0.r * amount, g: c0.g * amount, b: c0.b * amount} 
}

export let addColor = (c0:{r:number,g:number,b:number},c1:{r:number,g:number,b:number}) => {
    return {r: c0.r + c1.r, g: c0.g + c1.g, b: c0.b + c1.b, a:1} 
}


export let scale3d = (p0:{x:number,y:number,z:number}, amount:number) => {
    return {x: p0.x * amount, y: p0.y * amount, z: p0.z * amount} 
}

export let multiply2dToScalar = (p0:{x:number,y:number}, scalar:number) => {
    return {x: p0.x * scalar, y: p0.y * scalar} 
}

export let length2 = (v:{x:number,y:number,z:number}) => {
    return dot(v,v)
}

export let normalize = (v:{x:number,y:number,z:number}) => {
    //T length2() const { return x * x + y * y + z * z; } 

    let nor2 = length2(v)
    if (nor2 > 0) {
        let invNor = 1 / sqrt(nor2)
        v.x *= invNor
        v.y *= invNor
        v.z *= invNor
    }

    //TODO: figure out why this was broken or why i had it to begin with?
    // let length = length3d(v)
    // let x = v.x / length
    // let y = v.y / length
    // let z = v.z / length
    // v.x = x
    // v.y = y
    // v.z = z
}

export let dot = (a:{x:number,y:number,z:number},b:{x:number,y:number,z:number}) => {
    return (a.x * b.x) + (a.y * b.y) + (a.z * b.z)
}

export let cross = (a:{x:number,y:number,z:number}, b:{x:number,y:number,z:number}) => {
    //ax  ay  az  ax ay az
    //bx  by  bz  bx by bz

    let x = (a.y * b.z) - (b.y * a.z)
    let y = (a.z * b.x) - (b.z * a.x)
    let z = (a.x * b.y) - (b.x * a.y)

    return {x,y,z}
}

export let barycentric = (p:{x:number,y:number,z:number}, triangle:[{x:number,y:number,z:number},{x:number,y:number,z:number},{x:number,y:number,z:number}]) => {
    //https://gamedev.stackexchange.com/questions/23743/whats-the-most-efficient-way-to-find-barycentric-coordinates
    let v0 = subtract3d(triangle[1],triangle[0])
    let v1 = subtract3d(triangle[2],triangle[0])
    let v2 = subtract3d(p,triangle[0])

    let d00 = dot(v0,v0)
    let d01 = dot(v0,v1)
    let d11 = dot(v1,v1)
    let d20 = dot(v2,v0)
    let d21 = dot(v2,v1)

    let denom = (d00 * d11) - (d01 * d01)

    let v = ((d11 * d20) - (d01 * d21)) / denom
    let w = ((d00 * d21) - (d01 * d20)) / denom
    let u = 1.0 - v - w

    return {x: u, y: v, z: w}
}

export let mix = (a:number, b:number, mix:number) => {
    return b * mix + a * (1 - mix); 
} 

export let mat4x4 = (a:number,b:number,c:number,d:number,e:number,f:number,g:number,h:number,i:number,j:number,k:number,l:number,m:number,n:number,o:number,p:number) => {
    let M = new Float32Array(16)

    //[ 0, 1, 2, 3]
    //[ 4, 5, 6, 7]
    //[ 8, 9,10,11]
    //[12,13,14,15]

    // M[0] = a
    // M[4] = b
    // M[8] = c
    // M[12] = d
    // M[1] = e
    // M[5] = f
    // M[9] = g
    // M[13] = h
    // M[2] = i
    // M[6] = j
    // M[10] = k
    // M[14] = l
    // M[3] = m
    // M[7] = n
    // M[11] = o
    // M[15] = p

    M[0] = a
    M[1] = b
    M[2] = c
    M[3] = d
    M[4] = e
    M[5] = f
    M[6] = g
    M[7] = h
    M[8] = i
    M[9] = j
    M[10] = k
    M[11] = l
    M[12] = m
    M[13] = n
    M[14] = o
    M[15] = p    
    return M
}