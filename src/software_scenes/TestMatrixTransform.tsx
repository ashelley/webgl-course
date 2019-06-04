import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { Colors, makeColor, vec2, vec3, vec3i, Color } from "../software_renderer/helpers";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import scaleNumberIntoRange from "../helpers/scaleNumberIntoRange";
import PseudoRandom from "../helpers/PseudoRandom";
import { calculateSurfaceNormal } from "../helpers/calculateSurfaceNormal";
import { normalize, multiply2d, multiply3d, dot } from "../helpers/math";
import Matrix4 from "../helpers/Matrix4";
import Vector3 from "../helpers/Vector3";
import Vector2 from "../helpers/Vector2";

export default class TestMaxtrixTransform extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

class Renderer extends RendererBase {

    obj: Obj

    perspective:Float32Array

    async init() {
        //let objSource = await loadTextFile({url: "models/african_head.obj"})
        //let objSource = await loadTextFile({url: "models/cube.obj"})
        //let objSource = await loadTextFile({ url: "models/siamese_cat_lowpoly.obj" })
        let objSource = await loadTextFile({ url: "models/susan.obj" })
        this.obj = parseObjFile(objSource, { flipYUV: true, disableParseUvs: true, disableParseNormals: true })

        this.setupZBuffer()

        let aspect = this.width/this.height;

        let viewWidth = 5
        let viewDepth = 5
        let zNear = -viewDepth/2
        let zFar = viewDepth/2

        //this.perspective = this.createperspectiveMatrix(90,aspect,zNear,zFar)        
        this.perspective = this.createOrthoMatrix(viewWidth,aspect,zNear,zFar)        
    

        //this.perspective = Matrix4.identity()
        //Matrix4.perspective(this.perspective,45,this.width/this.height,zNear,zFar)
    }

    createOrthoMatrix(viewWidth:number,aspect:number, near:number,far:number) {
        let m = Matrix4.identity()
        m[0] = 1 / viewWidth
        m[5] = 1 / viewWidth * aspect
        m[10] = - (2 / far - near)
        m[11] = - (far + near / far - near)
        m[15] = 1
        return m
    }

    //NOTE: this isn't working?
    createperspectiveMatrix(fov:number,aspect:number,near:number,far:number) {
        let tanThetaOver2 = Math.tan(fov * Math.PI / 360.0)
        let m = Matrix4.identity()
        m[0] = 1/tanThetaOver2
        m[5] = aspect/tanThetaOver2
        m[10] = (near + far) / (near - far)
        m[14] = 2 * near * far / (near - far)
        m[11] = -1
        m[15] = 0

        return m
    }

    doRenderWork() {
        let obj = this.obj
        let i = 0;
        let verts = obj.faces

        let lightDir = vec3(0, 0, 1)

        //this.drawAxis()

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

            let normal = calculateSurfaceNormal(vec3(x0,y0,z0), vec3(x1,y1,z1), vec3(x2,y2,z2))                             
            //let normal = {x: verts[i].normals[0],y: verts[i].normals[1],z:verts[i].normals[2]}
            normalize(normal)            

            let [projectedX0,projectedY0,projectedZ0] = Matrix4.multiplyVector(this.perspective,[x0,y0,z0,1])
            let [projectedX1,projectedY1,projectedZ1] = Matrix4.multiplyVector(this.perspective,[x1,y1,z1,1])
            let [projectedX2,projectedY2,projectedZ2] = Matrix4.multiplyVector(this.perspective,[x2,y2,z2,1])

            //this.wireframeTriangle(v0,v1,v2,Colors.PURPLE)
            // this.drawLine(projectedX0,projectedY0,projectedX1,projectedY1,Colors.BLUE)            
            // this.drawLine(projectedX1,projectedY1,projectedX2,projectedY2,Colors.YELLOW)
            // this.drawLine(projectedX2,projectedY2,projectedX0,projectedY0,Colors.GREEN)

            x0 = projectedX0
            y0 = projectedY0
            z0 = projectedZ0

            x1 = projectedX1
            y1 = projectedY1
            z1 = projectedZ1
            
            x2 = projectedX2
            y2 = projectedY2
            z2 = projectedZ2

            let v0 = vec3(x0, y0, z0)
            let v1 = vec3(x1, y1, z1)
            let v2 = vec3(x2, y2, z2)

            let intensity = dot(normal, lightDir)

            if (intensity > 0) {
                let color = makeColor(255 * intensity, 255 * intensity, 255 * intensity)

                color = Colors.PURPLE
                this.shadeTriangle(v0, v1, v2, color)
                this.wireframeTriangle(v0,v1,v2, color)                
            }            

            i+=3
        }
    }

    drawAxis() {
        this.drawLine(-0.5,0,0.5,0, Colors.GREEN)
        this.drawLine(0,-0.5,0,0.5, Colors.RED)
        this.drawLine(-0.5,-0.5,0.5,0.5, Colors.YELLOW)        
    }

    wireframeTriangle(v0:Vector3,v1:Vector3,v2:Vector3, color:Color) {
        this.drawLine(v0.x,v0.y,v1.x,v1.y,color)
        this.drawLine(v1.x,v1.y,v2.x,v2.y,color)
        this.drawLine(v2.x,v2.y,v0.x,v0.y,color)
    }

    shadeTriangle(v0:Vector3,v1:Vector3,v2:Vector3, color:Color) {

        let x0 = v0.x
        let y0 = v0.y
        let z0 = v0.z

        let x1 = v1.x
        let y1 = v1.y
        let z1 = v1.z        

        let x2 = v1.x
        let y2 = v1.y
        let z2 = v1.z                

        // let x0 = scaleNumberIntoRange(v0.x,-1,1,0,this.width)
        // let y0 = scaleNumberIntoRange(v0.y,-1,1,0,this.height)
        // let z0 = v0.z
        
        // let x1 = scaleNumberIntoRange(v1.x,-1,1,0,this.width)        
        // let y1 = scaleNumberIntoRange(v1.y,-1,1,0,this.height)        
        // let z1 = v1.z

        // let x2 = scaleNumberIntoRange(v2.x,-1,1,0,this.width)
        // let y2 = scaleNumberIntoRange(v2.y,-1,1,0,this.height)                
        // let z2 = v2.z

        let t0 = vec3i(x0,y0,z0)
        let t1 = vec3i(x1,y1,z1)
        let t2 = vec3i(x2,y2,z2)

        this.triangleShadedZBuffer(t0, t1, t2, color)
    }

    drawLine(x0:number,y0:number,x1:number,y1:number,color:Color) {
        let screenX0 = Math.floor(scaleNumberIntoRange(x0,-1,1,0,this.width))
        let screenY0 = Math.floor(scaleNumberIntoRange(y0,-1,1,0,this.height))
        let screenX1 = Math.floor(scaleNumberIntoRange(x1,-1,1,0,this.width))
        let screenY1 = Math.floor(scaleNumberIntoRange(y1,-1,1,0,this.height))

        this.lineXY(screenX0,screenY0,screenX1,screenY1,color)

    }
}
