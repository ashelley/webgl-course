import Vector3 from "../helpers/Vector3";
import { Color } from "./Color";
import { subtract2d, subtract3d, dot, length3d, length2, sqrt } from "../helpers/math";


export interface InterSectResult {
    t0:number
    t1:number
    hit:boolean
}

export class Sphere {
    center:Vector3
    radius:number
    radiusSquared:number
    surfaceColor:Color
    emissionColor:Color
    transparency:number
    reflectivity:number

    constructor(center:Vector3,radius:number) {
        this.center = center
        this.radius = radius        
        this.radiusSquared = radius * radius
    }

    rayIntersecGeometric(position:Vector3, direction:Vector3, result:InterSectResult) {
        result.t0 = NaN
        result.t1 = NaN
        result.hit = false

        //https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
        let l = subtract3d(this.center,position)
        let tca = dot(l,direction)
        if (tca < 0) return //NOTE: this means the ray is going away from our sphere
        //let d2 = dot(l,l) - (tca * tca) //NOTE: this is basically doing pythorem theorm
        let d2 = length2(l) - (tca * tca) //NOTE: this is basically doing pythorem theorm
        if (d2 > this.radiusSquared) return //NOTE: basically d2 is a fake radius, we don't bother square rooting because
                                                  //      we just need to know if d2 would be inside sphere aka less than radius

        let thc = Math.sqrt(this.radiusSquared - d2) //NOTE: thc is the distance from where d2 cross our ray and the surface of the sphere
        
        result.hit = true
        result.t0 = tca - thc
        result.t1 = tca + thc
    }

    rayIntersectAnalytic(position:Vector3, direction:Vector3, result:InterSectResult) {
        result.t0 = NaN
        result.t1 = NaN
        result.hit = false        

        let l = subtract3d(position, this.center)
        let a = dot(direction,direction)
        let b = 2 * dot(direction,l)
        let c = dot(l,l) - this.radiusSquared

        this.solveQuadratic(a,b,c,result)                
    }

    solveQuadratic (a:number, b:number, c:number, result:InterSectResult)
    { 
        let discr = b * b - 4 * a * c; 
        if (discr < 0) return; 
        
        result.hit = true        
        
        if (discr == 0) {
            result.t0 = - 0.5 * b / a
            result.t1 = result.t0
        } else { 
            let q = (b > 0) ? 
                -0.5 * (b + sqrt(discr)) : 
                -0.5 * (b - sqrt(discr))
            
            result.t0 = q / a; 
            result.t1 = c / q; 
        }      

        if(result.t0 > result.t1) {
            let t0 = result.t0
            result.t0 = result.t1
            result.t1 = result.t0
        }
    }     
}

export let createSphere = (args:{center:Vector3, radius:number,surfaceColor:Color,emissionColor?:Color,transparency:number,reflectivity:number}) => {
    let sphere = new Sphere(args.center,args.radius)
    sphere.surfaceColor = args.surfaceColor
    sphere.emissionColor = args.emissionColor
    sphere.transparency = args.transparency
    sphere.reflectivity = args.reflectivity

    return sphere
}