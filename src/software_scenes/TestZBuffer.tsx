import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { Colors, makeColor, vec2, vec3 } from "../software_renderer/helpers";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import scaleNumberIntoRange from "../helpers/scaleNumberIntoRange";
import PseudoRandom from "../helpers/PseudoRandom";
import { calculateSurfaceNormal } from "../helpers/calculateSurfaceNormal";
import { normalize, multiply2d, multiply3d, dot } from "../helpers/math";

export default class TestZBuffer extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

class Renderer extends RendererBase {

    obj: Obj

    rng = new PseudoRandom(120921321312)

    async init() {
        //let objSource = await loadTextFile({url: "models/african_head.obj"})
        //let objSource = await loadTextFile({url: "models/cube.obj"})
        let objSource = await loadTextFile({ url: "models/siamese_cat_lowpoly.obj" })
        //let objSource = await loadTextFile({ url: "models/susan.obj" })
        this.obj = parseObjFile(objSource, { flipYUV: true, disableParseUvs: true, disableParseNormals: true })

        this.setupZBuffer()
    }

    doRenderWork() {
        let obj = this.obj
        let i = 0;
        let verts = obj.faces

        let lightDir = vec3(0, 0, 1)

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

            let width = this.width
            let height = this.height

            let scale = 0.5

            width = 600
            height = 600

            width *= scale
            height *= scale

            let translateY = -150*scale
            let translateX = this.width / 2 - (300)*scale

            scale = 1
            translateX = 0
            translateY = 0

            x0 = Math.floor(scaleNumberIntoRange(x0, -1, 1, 0, width)) + translateX
            y0 = Math.floor(scaleNumberIntoRange(y0, -1, 1, 0, height)) - translateY

            x1 = Math.floor(scaleNumberIntoRange(x1, -1, 1, 0, width)) + translateX
            y1 = Math.floor(scaleNumberIntoRange(y1, -1, 1, 0, height)) - translateY
            z1 = Math.floor(z1)

            x2 = Math.floor(scaleNumberIntoRange(x2, -1, 1, 0, width)) + translateX
            y2 = Math.floor(scaleNumberIntoRange(y2, -1, 1, 0, height)) - translateY

            let normal = calculateSurfaceNormal(v0, v1, v2)
            //let normal = {x: verts[i].normals[0],y: verts[i].normals[1],z:verts[i].normals[2]}
            normalize(normal)

            let intensity = dot(normal, lightDir)
            intensity *= 2

            if (intensity > 0) {
                let color = makeColor(255 * intensity, 255 * intensity, 255 * intensity)
                let t0 = vec3(x0, y0, z0)
                let t1 = vec3(x1, y1, z1)
                let t2 = vec3(x2, y2, z2)
                this.triangleShadedZBuffer(t0, t1, t2, color)
            }

            i+=3

        }
    }
}
