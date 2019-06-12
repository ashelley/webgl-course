import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { Colors, makeColor, vec2, vec3, vec3i, Color } from "../software_renderer/helpers";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import scaleNumberIntoRange from "../helpers/scaleNumberIntoRange";
import PseudoRandom from "../helpers/PseudoRandom";
import { calculateSurfaceNormal } from "../helpers/calculateSurfaceNormal";
import { normalize, multiply2d, multiply3d, dot, subtract3d, cross } from "../helpers/math";
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
    worldToViewMatrix:Float32Array
    viewToClipMatrix:Float32Array
    

    async init() {
        let objSource = await loadTextFile({url: "models/african_head.obj"})
        //let objSource = await loadTextFile({url: "models/cube.obj"})
        //let objSource = await loadTextFile({ url: "models/siamese_cat_lowpoly.obj" })
        //let objSource = await loadTextFile({ url: "models/susan.obj" })
        this.obj = parseObjFile(objSource, { flipYUV: true, disableParseUvs: true, disableParseNormals: true })

        this.setupZBuffer()

        // let aspect = this.width/this.height;

        // let viewWidth = 5
        // let viewDepth = 255
        // let zNear = -viewDepth/2
        // let zFar = viewDepth/2

        //this.perspective = this.createperspectiveMatrix(90,aspect,zNear,zFar)        
        //this.perspective = this.createOrthoMatrix(viewWidth,aspect,zNear,zFar)        
    

        //this.perspective = Matrix4.identity()
        //Matrix4.perspective(this.perspective,45,this.width/this.height,zNear,zFar)

        let eye = vec3(0,0,0)
        let target = vec3(0,0,-1)
        let up = vec3(0,1,0)

        this.worldToViewMatrix = this.createWorldToViewMatrix(eye,target,up)      
        //this.viewToClipMatrix = this.createperspectiveMatrix(90,this.width/this.height,0,1)
        this.viewToClipMatrix = this.createOrthoMatrix(2,this.width/this.height,1000,-1000)
        //this.viewPortMatrix = this.createViewportMatrix(0, 0,this.width/2,this.height/2, 255)
    }

    createViewportMatrix(x:number,y:number,width:number,height:number, depth:number) {
        let viewportMatrix = Matrix4.identity()
        viewportMatrix[3] = x + width / 2.0
        viewportMatrix[7] = y + height / 2.0
        viewportMatrix[11] = depth / 2.0

        viewportMatrix[0] = width / 2.0
        viewportMatrix[5] = height / 2.0
        viewportMatrix[10] = depth / 2.0

        return viewportMatrix
    }

    createWorldToViewMatrix(eye:Vector3, target:Vector3, up:Vector3) {
        // https://www.3dgep.com/understanding-the-view-matrix/
        let zAxis = subtract3d(eye,target)
        normalize(zAxis)
        
        let xAxis = cross(up,zAxis)
        normalize(xAxis)
        
        let yAxis = cross(zAxis,xAxis) // should already be normalized?
        normalize(yAxis)

        let orientation = Matrix4.identity()
        
        //column 0
        orientation[0] = xAxis.x
        orientation[4] = xAxis.y
        orientation[8] = xAxis.z
        orientation[12] = 0

        //column 1
        orientation[1] = yAxis.x
        orientation[5] = yAxis.y
        orientation[9] = yAxis.z
        orientation[13] = 0

        //column 2
        orientation[2] = zAxis.x
        orientation[6] = zAxis.y
        orientation[10] = zAxis.z
        orientation[14] = 0

        //column 3
        orientation[3] = 0
        orientation[7] = 0
        orientation[11] = 0
        orientation[15] = 1

        let translation = Matrix4.identity()

        //column 0
        translation[0] = 1
        translation[4] = 0
        translation[8] = 0
        translation[12] = -eye.x

        //column 1
        translation[1] = 0
        translation[5] = 1
        translation[9] = 0
        translation[13] = -eye.y

        //column 2
        translation[2] = 0
        translation[6] = 0
        translation[10] = 1
        translation[14] = -eye.z

        //column 3
        translation[3] = 0
        translation[7] = 0
        translation[11] = 0
        translation[15] = 1

        let viewMatrix = new Float32Array(16)
        return Matrix4.mult(viewMatrix,orientation,translation)
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
            let objectX0 = verts[i+0].verts[0]
            let objectY0 = verts[i+0].verts[1]
            let objectZ0 = verts[i+0].verts[2]
            let objectX1 = verts[i+1].verts[0]
            let objectY1 = verts[i+1].verts[1]
            let objectZ1 = verts[i+1].verts[2]
            let objectX2 = verts[i+2].verts[0]
            let objectY2 = verts[i+2].verts[1]
            let objectZ2 = verts[i+2].verts[2]       

            let normal = calculateSurfaceNormal(vec3(objectX0,objectX0,objectZ0), vec3(objectX1,objectY1,objectZ1), vec3(objectX2,objectY2,objectZ2))                             
            //let normal = {x: verts[i].normals[0],y: verts[i].normals[1],z:verts[i].normals[2]}
            normalize(normal)            

            // let [projectedX0,projectedY0,projectedZ0] = Matrix4.multiplyVector(this.perspective,[x0,y0,z0,1])
            // let [projectedX1,screenY1,projectedZ1] = Matrix4.multiplyVector(this.perspective,[x1,y1,z1,1])
            // let [projectedX2,projectedY2,projectedZ2] = Matrix4.multiplyVector(this.perspective,[x2,y2,z2,1])

            let objectToWorldMatrix = Matrix4.identity()

            let [worldX0,worldY0,worldZ0] = Matrix4.multiplyVector(objectToWorldMatrix,[objectX0,objectY0,objectZ0,1])
            let [worldX1,worldY1,worldZ1] = Matrix4.multiplyVector(objectToWorldMatrix,[objectX1,objectY1,objectZ1,1])
            let [worldX2,worldY2,worldZ2] = Matrix4.multiplyVector(objectToWorldMatrix,[objectX2,objectY2,objectZ2,1])


            let [viewX0,viewY0,viewZ0] = Matrix4.multiplyVector(this.worldToViewMatrix,[worldX0,worldY0,worldZ0,1])
            let [viewX1,viewY1,viewZ1] = Matrix4.multiplyVector(this.worldToViewMatrix,[worldX1,worldY1,worldZ1,1])
            let [viewX2,viewY2,viewZ2] = Matrix4.multiplyVector(this.worldToViewMatrix,[worldX2,worldY2,worldZ2,1])
            
            let [clipX0,clipY0,clipZ0] = Matrix4.multiplyVector(this.viewToClipMatrix,[viewX0,viewY0,viewZ0,1])
            let [clipX1,clipY1,clipZ1] = Matrix4.multiplyVector(this.viewToClipMatrix,[viewX1,viewY1,viewZ1,1])
            let [clipX2,clipY2,clipZ2] = Matrix4.multiplyVector(this.viewToClipMatrix,[viewX2,viewY2,viewZ2,1])               

            //this.wireframeTriangle(v0,v1,v2,Colors.PURPLE)
            // this.drawLine(projectedX0,projectedY0,projectedX1,screenY1,Colors.BLUE)            
            // this.drawLine(projectedX1,screenY1,projectedX2,projectedY2,Colors.YELLOW)
            // this.drawLine(projectedX2,projectedY2,projectedX0,projectedY0,Colors.GREEN)

            let x0 = clipX0
            let y0 = clipY0
            let z0 = clipZ0

            let x1 = clipX1
            let y1 = clipY1
            let z1 = clipZ1
            
            let x2 = clipX2
            let y2 = clipY2
            let z2 = clipZ2

            //TODO: how do we perform perspective divide and go from clip space to to device space to screen space?
            let zMax = 1000

            // x0 = scaleNumberIntoRange(x0,-1,1,0,this.width)
            // y0 = scaleNumberIntoRange(y0,-1,1,0,this.height)
            // z0 = scaleNumberIntoRange(z0,-1,1,0,zMax)

            // x1 = scaleNumberIntoRange(x1,-1,1,0,this.width)
            // y1 = scaleNumberIntoRange(y1,-1,1,0,this.height)
            // z1 = scaleNumberIntoRange(z1,-1,1,0,zMax)
            
            // x2 = scaleNumberIntoRange(x2,-1,1,0,this.width)
            // y2 = scaleNumberIntoRange(y2,-1,1,0,this.height)
            // z2 = scaleNumberIntoRange(z2,-1,1,0,zMax)         
        

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
        this.drawClipSpaceLine(-0.5,0,0.5,0, Colors.GREEN)
        this.drawClipSpaceLine(0,-0.5,0,0.5, Colors.RED)
        this.drawClipSpaceLine(-0.5,-0.5,0.5,0.5, Colors.YELLOW)        
    }

    wireframeTriangle(v0:Vector3,v1:Vector3,v2:Vector3, color:Color) {
        // this.drawScreenSpaceLine(v0.x,v0.y,v1.x,v1.y,color)
        // this.drawScreenSpaceLine(v1.x,v1.y,v2.x,v2.y,color)
        // this.drawScreenSpaceLine(v2.x,v2.y,v0.x,v0.y,color)

        this.drawClipSpaceLine(v0.x,v0.y,v1.x,v1.y,color)
        this.drawClipSpaceLine(v1.x,v1.y,v2.x,v2.y,color)
        this.drawClipSpaceLine(v2.x,v2.y,v0.x,v0.y,color)        
    }

    shadeTriangle(v0:Vector3,v1:Vector3,v2:Vector3, color:Color) {

        // let x0 = v0.x
        // let y0 = v0.y
        // let z0 = v0.z

        // let x1 = v1.x
        // let y1 = v1.y
        // let z1 = v1.z        

        // let x2 = v1.x
        // let y2 = v1.y
        // let z2 = v1.z                

        let x0 = scaleNumberIntoRange(v0.x,-1,1,0,this.width)
        let y0 = scaleNumberIntoRange(v0.y,-1,1,0,this.height)
        let z0 = v0.z
        
        let x1 = scaleNumberIntoRange(v1.x,-1,1,0,this.width)        
        let y1 = scaleNumberIntoRange(v1.y,-1,1,0,this.height)        
        let z1 = v1.z

        let x2 = scaleNumberIntoRange(v2.x,-1,1,0,this.width)
        let y2 = scaleNumberIntoRange(v2.y,-1,1,0,this.height)                
        let z2 = v2.z

        let t0 = vec3i(x0,y0,z0)
        let t1 = vec3i(x1,y1,z1)
        let t2 = vec3i(x2,y2,z2)

        this.triangleShadedZBuffer(t0, t1, t2, color)
    }

    drawClipSpaceLine(x0:number,y0:number,x1:number,y1:number,color:Color) {
        if(x0 < -1 || x0 > 1) return
        if(y0 < -1 || y0 > 1) return

        let screenX0 = Math.floor(scaleNumberIntoRange(x0,-1,1,0,this.width))
        let screenY0 = Math.floor(scaleNumberIntoRange(y0,-1,1,0,this.height))
        let screenX1 = Math.floor(scaleNumberIntoRange(x1,-1,1,0,this.width))
        let screenY1 = Math.floor(scaleNumberIntoRange(y1,-1,1,0,this.height))

        this.lineXY(screenX0,screenY0,screenX1,screenY1,color)
    }

    drawScreenSpaceLine(x0:number,y0:number,x1:number,y1:number,color:Color) {
        let screenX0 = Math.floor(x0)
        let screenY0 = Math.floor(y0)
        let screenX1 = Math.floor(x1)
        let screenY1 = Math.floor(y1)

        if(screenX0 < 0) screenX0 = 0
        if(screenY0 < 0) screenY0 = 0
        if(screenX1 < 0) screenX1 = 0
        if(screenY1 < 0) screenY1 = 0        

        if(screenX0 > this.width) screenX0 = this.width
        if(screenY0 > this.height) screenY0 = this.height
        if(screenX1 > this.width) screenX1 = this.width
        if(screenY1 > this.height) screenY1 = this.height           

        this.lineXY(screenX0,screenY0,screenX1,screenY1,color)
    }    
}
