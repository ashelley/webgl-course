import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { Colors } from "../software_renderer/helpers";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import scaleNumberIntoRange from "../helpers/scaleNumberIntoRange";

export default class TestWireFrame extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas,width,height)
    }
}

class Renderer extends RendererBase {

    obj:Obj

    async init() {
        let objSource = await loadTextFile({url: "models/african_head.obj"})
        this.obj = parseObjFile(objSource, {flipYUV: true, disableParseUvs: true, disableParseNormals: true})        
    }

    doRenderWork() {
        let obj = this.obj
        let i = 0;
        let items = obj.faces
        while(i < items.length) {
            for(let vertIndex = 0; vertIndex < 3; vertIndex++) {                
                let p1 = (i++)
                let x0 = items[p1].verts[0]
                let y0 = items[p1].verts[1]

                let p2 = (i++)
                
                let x1 = items[p2].verts[0]
                let y1 = items[p2].verts[1]

                x0 = scaleNumberIntoRange(x0,-1,1,0,this.width)
                y0 = scaleNumberIntoRange(y0,-1,1,0,this.height)

                x1 = scaleNumberIntoRange(x1,-1,1,0,this.width)
                y1 = scaleNumberIntoRange(y1,-1,1,0,this.height)

                //this.lineCalcPixelsForSlope(x0,y0,x1,y1, Colors.WHITE)
                this.lineCalcPixelsForSlopeAccumulateError(x0,y0,x1,y1, Colors.WHITE)
            }
        }
    }
    
}
