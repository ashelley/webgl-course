import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import Matrix4 from "../helpers/Matrix4";
import Vector3 from "../helpers/Vector3";
import Vector2 from "../helpers/Vector2";
import { Sphere, createSphere, InterSectResult } from "../primatives/Sphere";
import { vec3 } from "../software_renderer/helpers";
import { makeFloatColor, Color, rgbToFloatColor, Colors, makeRGBColor } from "../primatives/Color";
import { normalize, multiply3d, scale3d, add3d, subtract3d, dot, mix, multiplyColor, scaleColor, addColor } from "../helpers/math";
import React from 'react'

type InsersectMode = 'geographic'|'analytic'
interface RendererState {
    intersectMode:InsersectMode
}

export default class TestRayTracer extends SoftwareSceneBase {

    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }

    getInitialState():RendererState {
        return {
            intersectMode: 'geographic'
        }
    }

    handleToggleIntersectMode = e => {
        e.preventDefault()
        e.stopPropagation()

        this.setState((state:RendererState) => {
            if(state.intersectMode == 'analytic') {
                return {intersectMode: 'geographic'}
            }
            return {intersectMode: 'analytic'}            
        })
    }

    debugUI(state:{intersectMode:InsersectMode}) {
        let renderer = this.renderer as Renderer        
        if(renderer != null) {
            renderer.intersectMode = state.intersectMode
        }
        return <>
            <div style={{textDecoration:'underline', cursor:'pointer'}} onClick={this.handleToggleIntersectMode}>IntersectMode: {state.intersectMode}</div>
        </>
    }
}

class Renderer extends RendererBase {

    spheres:Sphere[] = []
    backgroundColor:Color = rgbToFloatColor(Colors.ELECTRIC_INDIGO)
    maxRayDepth = 5
    intersectMode:InsersectMode    

    async init() {
        this.spheres.push(createSphere({center: vec3(0.0,-10004,-20),
                                        radius: 10000,
                                        surfaceColor: makeFloatColor(0.2,0.2,0.2),
                                        reflectivity: 0, 
                                        transparency: 0
                                       }))

        this.spheres.push(createSphere({center: vec3(0,0,-20),
                                        radius: 4,
                                        surfaceColor: makeFloatColor(1.0,0.32,0.36),
                                        reflectivity: 1, 
                                        transparency: 0.5
                                      }))                                       

        this.spheres.push(createSphere({center: vec3(5,-1,-15),
                                        radius: 2,
                                        surfaceColor: makeFloatColor(0.9,0.76,0.46),
                                        reflectivity: 1, 
                                        transparency: 0
                                      }))              
                                      
        this.spheres.push(createSphere({center: vec3(5,0,-25),
                                        radius: 3,
                                        surfaceColor: makeFloatColor(0.65,0.77,0.97),
                                        reflectivity: 1, 
                                        transparency: 0
                                      }))              
                                      
        this.spheres.push(createSphere({center: vec3(-5.5,0,-15),
                                        radius: 3,
                                        surfaceColor: makeFloatColor(0.9,0.9,0.9),
                                        reflectivity: 1, 
                                        transparency: 0
                                      }))                                         
                                      
        //light                                      
        this.spheres.push(createSphere({center: vec3(0,20,-30),
                                        radius: 3,
                                        surfaceColor: makeFloatColor(0,0,0),
                                        reflectivity: 0, 
                                        transparency: 0,
                                        emissionColor: makeFloatColor(3,3,3)
                                        }))         
    }

    sphereRayIntersection(sphere:Sphere, position:Vector3, direction:Vector3, result:InterSectResult) {
        if(this.intersectMode == 'analytic' ) {
            sphere.rayIntersectAnalytic(position,direction,result)
        }
        else {
            sphere.rayIntersecGeometric(position,direction,result)
        }        
    }

    rayTrace(start:Vector3, direction:Vector3, depth:number = 0):Color {
        let near = Infinity
        let objects = this.spheres

        let intersection = {t0:NaN,t1:NaN,hit:false}
        let closestObject:Sphere
        
        for(let i = 0; i < objects.length; i++) {
            let o = objects[i]
            this.sphereRayIntersection(o, start,direction,intersection)
            if(intersection.hit) {                
                let t0 = intersection.t0
                if (t0 < 0) {
                    t0 = intersection.t1
                }
                if(t0 < 0) {
                    t0 = intersection.t1
                }
                if(t0 < near) {
                    near = t0
                    closestObject = o                    
                }
            }
        }

        if(closestObject == null) {
            //return this.backgroundColor
            return makeRGBColor(2.0,2.0,2.0,1)
        }

        let surfaceColor = makeFloatColor(0,0,0)     

        let intersectionPoint = add3d(start, scale3d(direction, near))
        let normal = subtract3d(intersectionPoint, closestObject.center)
        normalize(normal)
        
        //let bias = 1e-4
        let bias = 9.9999997473787516 * Math.pow(10,-5)

        let isInside = false

        if(dot(direction,normal) > 0) {
            isInside = true
            normal = scale3d(normal, -1)
        }

        if((closestObject.transparency > 0 || closestObject.reflectivity > 0) && depth < this.maxRayDepth) {
            let dotDirNormal = dot(direction,normal)
            let facingRatio = -dotDirNormal
            let fresnelEffect = mix(Math.pow(1 - facingRatio,3),1,0.1)
            let reflectionDir = subtract3d(direction,scale3d(normal, 2 * dotDirNormal))
            normalize(reflectionDir)

            let startReflect = add3d(intersectionPoint,scale3d(normal,bias))

            let reflection = this.rayTrace(vec3(startReflect.x,startReflect.y,startReflect.z), vec3(reflectionDir.x,reflectionDir.y,reflectionDir.z), depth + 1)
            let refraction = makeFloatColor(0,0,0,0)

            if(closestObject.transparency != 0) {
                let ior = 1.1
                let eta = isInside ? ior : 1 / ior
                let cosi = -dot(normal,direction)
                let k = 1 - (eta * eta) * (1 - (cosi * cosi))

                let refractionDir = add3d(scale3d(direction,eta),scale3d(normal, (eta * cosi) - Math.sqrt(k)))
                normalize(refractionDir)                

                let startRefract = subtract3d(intersectionPoint,scale3d(normal,bias))

                refraction = this.rayTrace(vec3(startRefract.x,startRefract.y,startRefract.z), vec3(refractionDir.x,refractionDir.y,refractionDir.z), depth + 1)
            }

            surfaceColor = multiplyColor(addColor(scaleColor(reflection,fresnelEffect), scaleColor(scaleColor(refraction,1 - fresnelEffect), closestObject.transparency)), closestObject.surfaceColor)
        }
        else {
            for(let i = 0; i < objects.length; i++) {
                let o = objects[i]
                if(o.emissionColor != null) {
                    let transmission = makeFloatColor(1,1,1)
                    let lightDirection = subtract3d(o.center,intersectionPoint)
                    normalize(lightDirection)
                    for(let j = 0; j < objects.length; j++) {
                        if(i != j) {
                            let targetObject = objects[j]
                            let photonStart = add3d(intersectionPoint,scale3d(normal, bias))
                            this.sphereRayIntersection(targetObject, vec3(photonStart.x,photonStart.y,photonStart.z), vec3(lightDirection.x,lightDirection.y,lightDirection.z), intersection)
                            if(intersection.hit) {
                                transmission = makeFloatColor(0,0,0)
                            }
                        }
                    }

                    surfaceColor = addColor(
                            surfaceColor, 
                            multiplyColor(
                                scaleColor(
                                    multiplyColor(closestObject.surfaceColor,transmission),
                                    Math.max(0,dot(normal,lightDirection))
                                ),o.emissionColor))
                }
            }
        }

        //return addColor(surfaceColor,closestObject.emissionColor)
        if(closestObject.emissionColor) {
            return addColor(surfaceColor, closestObject.emissionColor)
        }
        return surfaceColor
    }

 
    doRenderWork() {
        let width = this.width
        let height = this.height

        let inverseWidth = 1.0 / width
        let inverseHeight = 1.0 / height
        let fov = 30
        let aspectRatio = width / height
        let angle = Math.tan(Math.PI * 0.5 * fov / 180)

        for(let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                let rayX = (2 * ((x + 0.5) * inverseWidth) -1 ) * angle * aspectRatio
                let rayY = (1 - 2 * ((y + 0.5) * inverseHeight)) * angle
                let rayDirection = vec3(rayX,rayY,-1)
                normalize(rayDirection)

                let rayStart = vec3(0,0,0)

                let color = this.rayTrace(rayStart,rayDirection)
                this.setPixelF(x,this.height-y,color)
            }
        }
    }
}
