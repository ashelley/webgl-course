import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import { mat4x4, edgeFunction, add3d } from "../helpers/math";
import Matrix4 from "../helpers/Matrix4";
import { Colors, makeFloatColor, floatToRGBColor } from "../primatives/Color";
import { vec2, vec4, vec3 } from "../software_renderer/helpers";

export default class GURU7_1 extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

class Renderer extends RendererBase {

    angleY:number = 0

    async init() {
        this.setSize(400,400)
    }

    doRenderWork() {
        this.clear()
        //triangle
        let v0 = vec4(0,50,0,1)
        let v1 = vec4(50,-50,0,1)
        let v2 = vec4(-50,-50,0,1)
        let worldPos = vec4(0,0,100,1)

        let vertices:{x:number,y:number,z:number,w:number}[] = []
        vertices.push(v0,v1,v2)


        let campos = vec4(0,0,-100,1)
        let camdir = vec4(0,0,0,1)
        let cam_u = vec4(1,0,0,1) //+x 
        let cam_v = vec4(0,1,0,1) //+y
        let cam_n = vec4(0,0,1,1) //+z
        let camtarget = vec4(0,0,0,0)

        let nearclip = 50
        let farclip = 500

        let mcam = Matrix4.identity()
        let mper = Matrix4.identity()
        let mscr = Matrix4.identity()

        let fov = 90
        let aspectRatio = this.width/this.height

        let viewplaneWidth = 2
        let viewplaneHeight = 2 / aspectRatio

        let tan_fov_div2 = Math.tan(fov/2*Math.PI/180)

        let cameraViewDistance = 0.5 * viewplaneWidth * tan_fov_div2

        let rightClippingPlane:{x:number,y:number,z:number}        
        let leftClippingPlane:{x:number,y:number,z:number}
        let topClippingPlane:{x:number,y:number,z:number}
        let bottomClippingPlane:{x:number,y:number,z:number}

        if(fov == 90) {
            rightClippingPlane = vec3(1,0,-1) //x=z
            leftClippingPlane = vec3(-1,0,-1) //-x=z
            topClippingPlane = vec3(0,1,-1) //y=z
            bottomClippingPlane = vec3(0,-1,-1) //-y=z            
        }
        else {

        }

        let mrot = Matrix4.identity()

        if(this.angleY > 0) {
            let cosTheta = Math.cos(this.angleY)
            let sinTheta = Math.sin(this.angleY)

            mrot = mat4x4(cosTheta, 0, -sinTheta, 0,
                          0,        1, 0        , 0,
                         sinTheta,  0, cosTheta,  0,
                         0,         0, 0,         1)
        }

        let transformedVertices:{x:number,y:number,z:number,w:number}[] = []
        
        for(let i = 0; i < vertices.length; i++) {
            let v = vertices[i]
            transformedVertices.push(vec4(v.x,v.y,v.z,v.w))            
        }

        for(var i = 0; i < transformedVertices.length;i++) {
            let v = transformedVertices[i]
            let [x,y,z,w] = Matrix4.multiplyVector(mrot,[v.x,v.y,v.z,v.w]) //rotate in local space           
            v.x = x
            v.y = y
            v.z = z
            v.w = w
        }

        for(var i = 0; i < transformedVertices.length; i++) {
            let v = transformedVertices[i]
            let newP = add3d(v,worldPos) // translate to world position without using matrix method
            v.x = newP.x
            v.y = newP.y
            v.z = newP.z            
        }


        // step 1: create the inverse translation matrix for the camera position        
        let matInverse = mat4x4( 1,        0,        0,        0,
                                 0,        1,        0,        0,
                                 0,        0,        1,        0,
                                 -campos.x,-campos.y,-campos.z,1 )

        let matInvX:Float32Array // inverse camera x axis rotation matrix            
        let matInvY:Float32Array // inverse camera y axis rotation matrix         
        let matInvZ:Float32Array // inverse camera z axis rotation matrix     

        // step 2: create the inverse rotation sequence for the camera
        // rember either the transpose of the normal rotation matrix or
        // plugging negative values into each of the rotations will result
        // in an inverse matrix        

        let thetaX = camdir.x
        let thetaY = camdir.y
        let thetaZ = camdir.z

        // compute the sine and cosine of the angle x        
        {
            let cosTheta = Math.cos(thetaX) // no change since cos(-x) = cos(x)
            let sinTheta = -Math.sin(thetaX) // sin(-x) = -sin(x)

            matInvX = mat4x4(1,  0,        0        , 0,
                             0,  cosTheta, sinTheta , 0,
                             0, -sinTheta, cosTheta , 0,
                             0, 0,         0        , 1)
        }

        // compute the sine and cosine of the angle y        
        {
            let cosTheta = Math.cos(thetaY) // no change since cos(-x) = cos(x)
            let sinTheta = -Math.sin(thetaY) // sin(-x) = -sin(x)

            matInvY = mat4x4(cosTheta, 0, -sinTheta,        0,
                             0,        1,        0,         0,
                             sinTheta, 0, cosTheta,         0,
                             0,        0,         0,        1)
        }     
        
        // compute the sine and cosine of the angle z        
        {
            let cosTheta = Math.cos(thetaZ) // no change since cos(-x) = cos(x)
            let sinTheta = -Math.sin(thetaZ) // sin(-x) = -sin(x)

            matInvZ = mat4x4(cosTheta, sinTheta, 0,       0,
                             -sinTheta,cosTheta, 0,       0,
                             0,        0,        1,        0,
                             0,        0,        0,        1)                             
        }          

        //ZYX SEQUENCE
        let matRot = new Float32Array(16)  // concatenated inverse rotation matrices            

        let mTmp = new Float32Array(16)
        Matrix4.mult(mTmp,matInvZ,matInvY)
        Matrix4.mult(matRot,mTmp,matInvX)

        let matCam = new Float32Array(16)
        Matrix4.mult(matCam, matInverse, matRot)

        //WORLD TO CAMERA
        for(var i = 0; i < transformedVertices.length; i++) {
            let v = transformedVertices[i]

            let [x,y,z,w] = Matrix4.multiplyVector(matCam, [v.x,v.y,v.z,v.w])            
            v.x = x
            v.y = y
            v.z = z
            v.w = w
        }        

        //CAMERA TO PERSPETIVE
        for(var i = 0; i < transformedVertices.length; i++) {
            let v = transformedVertices[i]

            let z = v.z

            v.x = cameraViewDistance * (v.x/z)
            v.y = cameraViewDistance * (v.y/z)
        }                   

        //PERSPECTIVE TO SCREEN
        
        let a = (0.5) * this.width  - 0.5
        let b = (0.5) * this.height - 0.5

        for(var i = 0; i < transformedVertices.length; i++) {
            let v = transformedVertices[i]

            v.x = a + a * v.x
            v.y = b + b * v.y
        }         

        // DRAW
        for(var i = 0; i < transformedVertices.length; i+=3) {
            let v0 = transformedVertices[i]
            let v1 = transformedVertices[i+1]
            let v2 = transformedVertices[i+2]

            this.screenSpaceLine(v0.x,v0.y, v1.x,v1.y, Colors.GREEN)
            this.screenSpaceLine(v1.x,v1.y, v2.x,v2.y, Colors.GREEN)
            this.screenSpaceLine(v2.x,v2.y, v0.x,v0.y, Colors.GREEN)
        }             

        this.angleY++

    }
}
