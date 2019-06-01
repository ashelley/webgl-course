import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { Colors, Point, swapPointXY, vec2, sortPointByY } from "../software_renderer/helpers";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import scaleNumberIntoRange from "../helpers/scaleNumberIntoRange";
import Vector2 from "../helpers/Vector2";
import { boundingBox } from "../helpers/boundingBox";
import { pointInTriangle } from "../helpers/pointInTriangle";

export default class TriangleRasterization extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas,width,height)
    }
}

let boundaryTriangle = (t0:Vector2, t1:Vector2, t2:Vector2, renderer:Renderer) => {
    sortPointByY(t0,t1)
    sortPointByY(t0,t2)
    sortPointByY(t1,t2)  
    renderer.line(t0,t1, Colors.GREEN)
    renderer.line(t1,t2, Colors.GREEN)
    renderer.line(t2,t0, Colors.RED)
}

class Renderer extends RendererBase {

    // obj:Obj

    // async init() {
    //     let objSource = await loadTextFile({url: "models/african_head.obj"})
    //     this.obj = parseObjFile(objSource, {flipYUV: true, disableParseUvs: true, disableParseNormals: true})        
    // }

    simpleOutlinedTriangles() {
        this.triangleWithoutOrdering(vec2(10,70), vec2(50,160), vec2(70,80), Colors.RED)
        this.triangleWithoutOrdering(vec2(180,50), vec2(150,1), vec2(70,180), Colors.WHITE)
        this.triangleWithoutOrdering(vec2(180,150), vec2(120,160), vec2(130,180), Colors.GREEN)
    }

    boundaryTriangles() {

        boundaryTriangle(vec2(10,70), vec2(50,160), vec2(70,80), this)
        boundaryTriangle(vec2(180,50), vec2(150,1), vec2(70,180), this)
        boundaryTriangle(vec2(180,150), vec2(120,160), vec2(130,180), this)      
    }

    segmentedTrigangles() {
        this.triangleOutlineSegmented(vec2(10,70), vec2(50,160), vec2(70,80))
        this.triangleOutlineSegmented(vec2(180,50), vec2(150,1), vec2(70,180))
        this.triangleOutlineSegmented(vec2(180,150), vec2(120,160), vec2(130,180))        
    }

    shadedTriangles() {
        this.triangleShadedSegmented(vec2(10,70), vec2(50,160), vec2(70,80), Colors.RED)
        this.triangleShadedSegmented(vec2(180,50), vec2(150,1), vec2(70,180), Colors.WHITE)
        this.triangleShadedSegmented(vec2(180,150), vec2(120,160), vec2(130,180), Colors.GREEN)
    }

    boundingBoxBarryCentricTriangles() {
        var v1 = vec2(10,10)
        var v2 = vec2(100,30)
        var v3 = vec2(190,160)

        this.triangleShadedBBoxBaryCentric(v1,v2,v3,Colors.PURPLE)
    }

    doRenderWork() {
        //this.simpleOutlinedTriangles()
        //this.boundaryTriangles()
        //this.segmentedTrigangles()
        //this.shadedTriangles()
        this.boundingBoxBarryCentricTriangles()
    }
    
}
