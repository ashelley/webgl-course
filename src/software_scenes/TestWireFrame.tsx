import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { Colors } from "../software_renderer/helpers";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";

export default class TestWireFrame extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas,width,height)
    }
}

class Renderer extends RendererBase {

    obj:Obj

    async init() {
        let objSource = await loadTextFile({url: "models/african_head.obj"})
        this.obj = parseObjFile(objSource, {flipYUV: true, disableParseUvs: true})        
    }

    doRenderWork() {
        let obj = this.obj
        for(let i = 0; i < obj.faces.length; i++) {
            let face = obj.faces[i]
            for(let vertIndex = 0; vertIndex < 3; vertIndex++) {
                let vertIndex2 = vertIndex + 4
                
                let x0 = face.verts[vertIndex + 0]
                let y0 = face.verts[vertIndex + 1]
                
                let x1 = face.verts[(vertIndex2 + 0) % 3]
                let y1 = face.verts[(vertIndex2 + 2) % 3]

                this.lineCalcPixelsForSlopeAccumulateError(x0,y0,x1,y1, Colors.WHITE)
            }
        }
    }
    
}