import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import { mat4x4 } from "../helpers/math";
import Matrix4 from "../helpers/Matrix4";
import { Colors } from "../primatives/Color";

export default class TestXTree extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

class Renderer extends RendererBase {

    obj: Obj

    cameraToWorld:Float32Array
    worldToCamera:Float32Array

    canvasWidth:number = 2
    canvasHeight:number = 2    

    async init() {
        let objSource = await loadTextFile({url: "models/xtree.obj"})
        //let objSource = await loadTextFile({url: "models/cube.obj"})
        //let objSource = await loadTextFile({ url: "models/siamese_cat_lowpoly.obj" })
        //let objSource = await loadTextFile({ url: "models/susan.obj" })
        this.obj = parseObjFile(objSource, { flipYUV: true, disableParseUvs: true, disableParseNormals: true })

        this.cameraToWorld = mat4x4(0.871214, 0, -0.490904, 0, -0.192902, 0.919559, -0.342346, 0, 0.451415, 0.392953, 0.801132, 0, 14.777467, 29.361945, 27.993464, 1)
        this.worldToCamera = new Float32Array(16)
        Matrix4.invert(this.worldToCamera, this.cameraToWorld)
            
        this.setSize(512,512)

    }

    computePixelCoordinates(p:{x:number,y:number,z:number}, worldToCamera:Float32Array, canvasWidth:number, canvasHeight:number, imageWidth:number, imageHeight:number):{x:number,y:number} {
        let [cameraX,cameraY,cameraZ,cameraW] = Matrix4.multiplyVector(worldToCamera,[p.x,p.y,p.z,1])
        let screenX = cameraX / -cameraZ
        let screenY = cameraY / -cameraZ

        let ndcX = (screenX + canvasWidth * 0.5) / canvasWidth
        let ndcY = (screenY + canvasHeight * 0.5) / canvasHeight

        let rasterX = Math.floor(ndcX * imageWidth)
        let rasterY = Math.floor((1 - ndcY) * imageHeight)

        return {x: rasterX, y: rasterY}
    }

    doRenderWork() {
        let obj = this.obj
        let i = 0;
        let faces = obj.faces


        while (i < faces.length) {
            let verts = faces[i].verts
            let objectX0 = verts[0]
            let objectY0 = verts[1]
            let objectZ0 = verts[2]
            let objectX1 = verts[3]
            let objectY1 = verts[4]
            let objectZ1 = verts[5]
            let objectX2 = verts[6]
            let objectY2 = verts[7]
            let objectZ2 = verts[8]       

            let v0Raster = this.computePixelCoordinates({x: objectX0, y: objectY0, z: objectZ0}, this.worldToCamera, this.canvasWidth, this.canvasHeight, this.width, this.height)
            let v1Raster = this.computePixelCoordinates({x: objectX1, y: objectY1, z: objectZ1}, this.worldToCamera, this.canvasWidth, this.canvasHeight, this.width, this.height)
            let v2Raster = this.computePixelCoordinates({x: objectX2, y: objectY2, z: objectZ2}, this.worldToCamera, this.canvasWidth, this.canvasHeight, this.width, this.height)

            this.lineXY(v0Raster.x, this.height - v0Raster.y,v1Raster.x,this.height - v1Raster.y, Colors.BLUE)
            this.lineXY(v1Raster.x, this.height - v1Raster.y,v2Raster.x,this.height - v2Raster.y, Colors.BLUE)
            this.lineXY(v2Raster.x, this.height - v2Raster.y,v0Raster.x,this.height - v0Raster.y, Colors.BLUE)

            i++
        }
    }
}
