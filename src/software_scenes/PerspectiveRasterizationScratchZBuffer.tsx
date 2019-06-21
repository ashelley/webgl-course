import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import { mat4x4, edgeFunction } from "../helpers/math";
import Matrix4 from "../helpers/Matrix4";
import { Colors, makeFloatColor, floatToRGBColor, makeRGBColor } from "../primatives/Color";
import { vec2, vec3 } from "../software_renderer/helpers";
import React from "react";

enum RenderMode {
    DEFAULT = "",
    ZBUFFER = "z",
    CHECKBOARD = "cb"
}

interface RendererState {
    renderMode:RenderMode
}

export default class PerspectiveRasterizationScratchZBuffer extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }

    getInitialState():RendererState {
        return {
            renderMode: RenderMode.DEFAULT
        }
    }    

    handleRenderModeChange = e => {
        let renderMode = e.target.value
        this.setState(state => {
            return {
                renderMode
            }
        })
    }

    debugUI(state:RendererState) {
        let renderer = this.renderer as Renderer        
        if(renderer != null) {
            renderer.renderMode = state.renderMode
        }
        return <>
            <div>
                <label>Render Mode:</label>
                <select value={state.renderMode} onChange={this.handleRenderModeChange}>
                    <option value={RenderMode.DEFAULT}>Default</option>
                    <option value={RenderMode.ZBUFFER}>ZBuffer</option>                    
                    <option value={RenderMode.CHECKBOARD}>Checkboard</option>
                </select>
            </div>
        </>
    }    
}

class Renderer extends RendererBase {

    renderMode:RenderMode
    zBuffer:Float32Array

    async init() {
        this.setSize(512,512)

        let bufferSize = this.width*this.height
        let arrayBuffer = new ArrayBuffer(bufferSize)
        this.zBuffer = new Float32Array(arrayBuffer)
    }

    doRenderWork() {
        //https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/perspective-correct-interpolation-vertex-attributes        
        let v0 = vec3( 13, 34, 114)
        let v1 = vec3( 29,-15, 44)
        let v2 = vec3(-48,-10, 82)

        let c0 = makeFloatColor(0,0,1)
        let c1 = makeFloatColor(0,1,0)
        let c2 = makeFloatColor(1,0,0)

        let st0 = vec2(0,1)
        let st1 = vec2(1,0)
        let st2 = vec2(0,0)

        //project onto screen
        v0.x /= v0.z
        v0.y /= v0.z

        v1.x /= v1.z
        v1.y /= v1.z
        
        v2.x /= v2.z
        v2.y /= v2.z         
        
        //convert screen->NDC->raster all at once
        v0.x = (1 + v0.x) * 0.5 * this.width
        v0.y = (1 + v0.y) * 0.5 * this.height

        v1.x = (1 + v1.x) * 0.5 * this.width
        v1.y = (1 + v1.y) * 0.5 * this.height        

        v2.x = (1 + v2.x) * 0.5 * this.width
        v2.y = (1 + v2.y) * 0.5 * this.height      
        
        //perspective correct of vertext colors
        c0.r /= v0.z
        c0.g /= v0.z
        c0.b /= v0.z

        c1.r /= v1.z
        c1.g /= v1.z
        c1.b /= v1.z
        
        c2.r /= v2.z
        c2.g /= v2.z
        c2.b /= v2.z

        st0.x /= v0.z
        st0.y /= v0.z

        st1.x /= v1.z
        st1.y /= v1.z
        
        st2.x /= v2.z
        st2.y /= v2.z        

        //precompute inverse of z
        v0.z = 1 / v0.z
        v1.z = 1 / v1.z
        v2.z = 1 / v2.z

        let areaOfTriangle = edgeFunction(v0,v1,v2)

        for(let j = 0; j < this.height; j++) {
            for(let i = 0; i < this.width; i++) {
                let p = vec3(i + 0.5, j + 0.5, 0)

                let w0 = edgeFunction(v1,v2,p)
                let w1 = edgeFunction(v2,v0, p)
                let w2 = edgeFunction(v0,v1,p)

                if(w0 >= 0 && w1 >= 0 && w2 >= 0) {
                    w0 /= areaOfTriangle
                    w1 /= areaOfTriangle
                    w2 /= areaOfTriangle


                    let r = w0 * c0.r + w1 * c1.r + w2 * c2.r
                    let g = w0 * c0.g + w1 * c1.g + w2 * c2.g
                    let b = w0 * c0.b + w1 * c1.b + w2 * c2.b

                    let s = w0 * st0.x + w1 * st1.x + w2 * st2.x
                    let t = w0 * st0.y + w1 * st1.y + w2 * st2.y

                    // perspective correction
                    let z = 1 / (w0 * v0.z + w1 * v1.z + w2 * v2.z)
                    r *= z
                    g *= z
                    b *= z

                    s *= z
                    t *= z

                    this.zBuffer[j + this.width + i] = z     

                    if(this.renderMode == RenderMode.ZBUFFER) {
                        this.setPixel(i,j, makeRGBColor(z,z,z))    
                    }
                    else if(this.renderMode == RenderMode.CHECKBOARD) {
                        let M = 10.0

                        // if (((s * M)  % 1.0) > 0.5 && ((t*M) % 1.0) < 0.5) {
                        //     this.setPixel(i, j, makeRGBColor(0,0,0))
                        // }
                        // else {
                        //     this.setPixel(i, j, makeRGBColor(255,255,255))
                        // }
    
                        let c = (s * M)  % 1.0 > 0.5 ? 1 : 0
                        c ^= (t * M)  % 1.0 < 0.5 ? 1 : 0
                        this.setPixel(i, j, floatToRGBColor({r:c,g:c,b:c,a:1}))  
                    }
                    else {
                        this.setPixel(i,j, floatToRGBColor({r,g,b,a:1}))
                    }                                                                                         
                }

            }
        }
    }
}
