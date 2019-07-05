import Vector3 from "./Vector3";
import Matrix4 from './Matrix4';

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

export let edgeFunction = (a:{x:number,y:number}, b:{x:number,y:number},c:{x:number,y:number}) => {
    return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)
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

enum RotationSequence {
    X = 1,
    Y = 2,
    Z = 4,
}

export let rotateMatrixXAxis = (thetaX:number) => {
    let cosTheta = Math.cos(thetaX)
    let sinTheta = Math.sin(thetaX)

    let mrot = mat4x4(1,        0,        0, 0,
                      0, cosTheta, sinTheta, 0,
                      0,-sinTheta,-cosTheta, 0,
                      0,         0, 0,         1)            
    return mrot
}

export let rotateMatrixYAxis = (thetaY:number) => {
    let cosTheta = Math.cos(thetaY)
    let sinTheta = Math.sin(thetaY)

    let mrot = mat4x4(cosTheta, 0, -sinTheta, 0,
                      0,        1, 0        , 0,
                      sinTheta, 0, cosTheta,  0,
                      0,        0, 0,         1)        
    return mrot
}

export let rotateMatrixZAxis = (thetaZ:number) => {
    let cosTheta = Math.cos(thetaZ)
    let sinTheta = Math.sin(thetaZ)

    let mrot = mat4x4( cosTheta, sinTheta, 0, 0,
                      -sinTheta, cosTheta, 0, 0,
                      0,         0,        1, 0,
                      0,         0,        0, 1)        
    return mrot    
}

export let buildRotationMatrixEuler = (thetaX:number, thetaY:number,thetaZ:number) => {
    let mrot:Float32Array

    let rotations = 0
    if(abs(thetaX) > Number.EPSILON) {
        rotations |= RotationSequence.X
    }
    if(abs(thetaY) > Number.EPSILON) {
        rotations |= RotationSequence.Y
    }
    if(abs(thetaZ) > Number.EPSILON) {
        rotations |= RotationSequence.Z
    }

    switch(rotations) {
        //NO ROTATION
        case 0: 
            mrot = Matrix4.identity()
            break; 
        //X ROTATION
        case 1: {
            mrot = rotateMatrixXAxis(thetaX)
            break;
        }
        //Y ROTATION
        case 2: {
            mrot = rotateMatrixYAxis(thetaY)
            break;
        }
        //XY ROTATION
        case 3: {
            let mx = rotateMatrixXAxis(thetaX)
            let my = rotateMatrixYAxis(thetaY)
            mrot = new Float32Array(16)
            Matrix4.mult(mrot,mx,my)
            break;
        }
        //Z ROTATION
        case 4: {
            mrot = rotateMatrixZAxis(thetaZ)
            break;            
        }
        //XZ ROTATION
        case 5: {
            let mx = rotateMatrixXAxis(thetaX)
            let mz = rotateMatrixZAxis(thetaZ)
            mrot = new Float32Array(16)
            Matrix4.mult(mrot,mx,mz)
            break;
        }
        //YZ ROTATION
        case 6: {
            let my = rotateMatrixYAxis(thetaY)
            let mz = rotateMatrixZAxis(thetaZ)
            mrot = new Float32Array(16)
            mrot = Matrix4.mult(mrot,my,mz)
            break;
        }
        case 7: {
            let mx = rotateMatrixYAxis(thetaX)
            let my = rotateMatrixYAxis(thetaY)
            let mz = rotateMatrixZAxis(thetaZ)
            let mtmp = new Float32Array(16)
            Matrix4.mult(mtmp,mx,my)            
            mrot = new Float32Array(16)
            Matrix4.mult(mrot,mtmp,mz)            
        }
    }

    return mrot;
}

export interface IRenderable {
    vertices: {x:number,y:number,z:number,w:number}[]    
    faceBaseColors:{r:number,g:number,b:number,a:number}[]
}

export interface IRenderList {
    vertices:{x:number,y:number,z:number,w:number}[]
    transformedVertices:{x:number,y:number,z:number,w:number}[]
    faceColors:{r:number,g:number,b:number,a:number}[]
}


export let applyTransformationMatrix = (vertices:{x:number,y:number,z:number,w:number}[], outputVertices:{x:number,y:number,z:number,w:number}[], mTransform:Float32Array) => {
    for(let i = 0; i < vertices.length; i++) {
        let vertex = vertices[i]
        let [x,y,z,w] = Matrix4.multiplyVector(mTransform, [vertex.x,vertex.y,vertex.z,vertex.w])
        let output = outputVertices[i]        
        output.x = x
        output.y = y
        output.z = z
        output.w = w
    }
}

export let applyTranslation = (vertices:{x:number,y:number,z:number,w:number}[], outputVertices:{x:number,y:number,z:number,w:number}[], translation:{x:number,y:number,z:number}) => {
    for(let i = 0; i < vertices.length; i++) {
        let vertex = vertices[i]
        let newpos = add3d(vertex,translation)
        let output = outputVertices[i]        
        output.x = newpos.x
        output.y = newpos.y
        output.z = newpos.z
    }        
}