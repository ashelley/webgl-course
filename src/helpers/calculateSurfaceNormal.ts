import { subtract3d } from "./math";

export let calculateSurfaceNormal = (a:{x:number,y:number,z:number},b:{x:number,y:number,z:number},c:{x:number,y:number,z:number}) => {
    //https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal

    let u = subtract3d(b,a)
    let v = subtract3d(c,a)

    let x = (u.y * v.z) - (u.z * v.y)
    let y = (u.z * v.x) - (u.x * v.z)
    let z = (u.x * v.y) - (u.y * v.x)

    return {x,y,z}
}