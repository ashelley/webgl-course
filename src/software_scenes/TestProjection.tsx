import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { vec3, vec3i } from "../software_renderer/helpers";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import { calculateSurfaceNormal } from "../helpers/calculateSurfaceNormal";
import { normalize, dot } from "../helpers/math";
import Matrix4 from "../helpers/Matrix4";
import { makeRGBColor, Colors } from "../primatives/Color";

export default class TestProjection extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

class Renderer extends RendererBase {

    obj: Obj

    async init() {
        let objSource = await loadTextFile({url: "models/african_head.obj"})
        //let objSource = await loadTextFile({url: "models/cube.obj"})
        //let objSource = await loadTextFile({ url: "models/siamese_cat_lowpoly.obj" })
        //let objSource = await loadTextFile({ url: "models/susan.obj" })
        this.obj = parseObjFile(objSource, { flipYUV: true, disableParseUvs: true, disableParseNormals: true })

        this.setupZBuffer()
    }

    createViewportMatrix(x:number,y:number,width:number,height:number, depth:number) {
        let viewport = Matrix4.identity()
        viewport[3] = x + width / 2.0
        viewport[7] = y + height / 2.0
        viewport[11] = depth / 2.0

        viewport[0] = width / 2.0
        viewport[5] = height / 2.0
        viewport[10] = depth / 2.0
        return viewport
    }

    doRenderWork() {
        let obj = this.obj
        let i = 0;
        let verts = obj.faces

        let lightDir = vec3(0, 0, 1)

        let width = 600
        let height = 600


        let viewport = this.createViewportMatrix(width / 8, height / 8, width * 3 / 4, height * 3 / 4, 255)
        
        //let viewport = Matrix4.identity()
        //Matrix4.rotate(viewport,30,[1,0,0])
        //Matrix4.translate(viewport,0,0,-1)
        //Matrix4.perspective(viewport,60,1,-1,100)

        let cameraPos = vec3(0,0,-3)
        let projection = Matrix4.identity()
        projection[15] = -1/cameraPos.z

        while (i < verts.length) {
            let x0 = verts[i+0].verts[0]
            let y0 = verts[i+0].verts[1]
            let z0 = verts[i+0].verts[2]
            let x1 = verts[i+1].verts[0]
            let y1 = verts[i+1].verts[1]
            let z1 = verts[i+1].verts[2]
            let x2 = verts[i+2].verts[0]
            let y2 = verts[i+2].verts[1]
            let z2 = verts[i+2].verts[2]

            let v0 = vec3(x0, y0, z0)
            let v1 = vec3(x1, y1, z1)
            let v2 = vec3(x2, y2, z2)

            let projected0 = this.applyProjection(viewport,projection,v0)
            let projected1 = this.applyProjection(viewport,projection,v1)
            let projected2 = this.applyProjection(viewport,projection,v2)

            x0 = projected0.x
            y0 = projected0.y
            z0 = projected0.z

            x1 = projected1.x
            y1 = projected1.y
            z1 = projected1.z

            x2 = projected2.x
            y2 = projected2.y
            z2 = projected2.z

            //x0 = Math.floor(scaleNumberIntoRange(x0, -1, 1, 0, width))
            //y0 = Math.floor(scaleNumberIntoRange(y0, -1, 1, 0, height))

            //x1 = Math.floor(scaleNumberIntoRange(x1, -1, 1, 0, width))
            //y1 = Math.floor(scaleNumberIntoRange(y1, -1, 1, 0, height))

            //x2 = Math.floor(scaleNumberIntoRange(x2, -1, 1, 0, width))
            //y2 = Math.floor(scaleNumberIntoRange(y2, -1, 1, 0, height))

            let normal = calculateSurfaceNormal(v0, v1, v2)
            //let normal = {x: verts[i].normals[0],y: verts[i].normals[1],z:verts[i].normals[2]}
            normalize(normal)

            let intensity = dot(normal, lightDir)
            intensity *= 2

            if (intensity > 0) {
                let color = makeRGBColor(255 * intensity, 255 * intensity, 255 * intensity)
                let t0 = vec3i(x0, y0, z0)
                let t1 = vec3i(x1, y1, z1)
                let t2 = vec3i(x2, y2, z2)

                color = Colors.PURPLE
                this.triangleShadedZBuffer(t0, t1, t2, color)
            }

            i+=3

        }
    }
}
