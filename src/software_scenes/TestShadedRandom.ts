import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { Colors, makeColor, vec2 } from "../software_renderer/helpers";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import scaleNumberIntoRange from "../helpers/scaleNumberIntoRange";
import PseudoRandom from "../helpers/PseudoRandom";

export default class TestShadedRandom extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas,width,height)
    }
}

class Renderer extends RendererBase {

    obj:Obj

    rng = new PseudoRandom(120921321312)

    async init() {
        //let objSource = await loadTextFile({url: "models/african_head.obj"})
        let objSource = await loadTextFile({url: "models/siamese_cat_lowpoly.obj"})
        this.obj = parseObjFile(objSource, {flipYUV: true, disableParseUvs: true, disableParseNormals: true})        
    }

    doRenderWork() {
        let obj = this.obj
        let i = 0;
        let items = obj.faces
        while(i < items.length - 10) {
            for(let vertIndex = 0; vertIndex < 3; vertIndex++) {                
                let p1 = (i++)
                let x0 = items[p1].verts[0]
                let y0 = items[p1].verts[1]

                let p2 = (i++)
                let x1 = items[p2].verts[0]
                let y1 = items[p2].verts[1]

                let p3 = (i++)
                let x2 = items[p3].verts[0]
                let y2 = items[p3].verts[1]                


                let width = this.width
                let height = this.height

                width = 300
                height = 300

                x0 = Math.floor(scaleNumberIntoRange(x0,-1,1,0,width))
                y0 = Math.floor(scaleNumberIntoRange(y0,-1,1,0,height))

                x1 = Math.floor(scaleNumberIntoRange(x1,-1,1,0,width))
                y1 = Math.floor(scaleNumberIntoRange(y1,-1,1,0,height))

                x2 = Math.floor(scaleNumberIntoRange(x2,-1,1,0,width))
                y2 = Math.floor(scaleNumberIntoRange(y2,-1,1,0,height))                 

                let r = this.rng.nextRange(0,255)
                let g = this.rng.nextRange(0,255)
                let b = this.rng.nextRange(0,255)

                let color = makeColor(r,g,b)

                let t0 = vec2(x0,y0)
                let t1 = vec2(x1,y1)
                let t2 = vec2(x2,y2)
                
                this.triangleShadedBBoxBaryCentric(t0,t1,t2,color)
            }
        }
    }
    
}
