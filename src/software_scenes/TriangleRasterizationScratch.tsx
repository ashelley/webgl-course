import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import { mat4x4, edgeFunction } from "../helpers/math";
import Matrix4 from "../helpers/Matrix4";
import { Colors, makeFloatColor, floatToRGBColor } from "../primatives/Color";
import { vec2 } from "../software_renderer/helpers";

export default class TriangleRasterizationScratch extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

class Renderer extends RendererBase {

    async init() {
        this.setSize(512,512)
    }

    doRenderWork() {
        let v0 = vec2(491.406, 411.406)
        let v1 = vec2(148.593, 68.5929)
        let v2 = vec2(148.593, 411.406)

        let c0 = makeFloatColor(1,0,0)
        let c1 = makeFloatColor(0,1,0)
        let c2 = makeFloatColor(0,0,1)

        let areaOfTriangle = edgeFunction(v0,v1,v2)

        for(let j = 0; j < this.height; j++) {
            for(let i = 0; i < this.width; i++) {
                let p = vec2(i + 0.5, j + 0.5)

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

                    this.setPixel(i,j, floatToRGBColor({r,g,b,a:1}))

                }

            }
        }
    }
}
