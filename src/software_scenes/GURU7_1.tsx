import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import { mat4x4, edgeFunction, add3d, rotateMatrixYAxis, rotateMatrixXAxis, rotateMatrixZAxis, buildRotationMatrixEuler } from "../helpers/math";
import Matrix4 from "../helpers/Matrix4";
import { Colors, makeFloatColor, floatToRGBColor } from "../primatives/Color";
import { vec2, vec4, vec3 } from "../software_renderer/helpers";
import { initializeEulerCamera, IEulerCamera, buildCameraMatrixEuler } from "../primatives/Camera";

export default class GURU7_1 extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

class Renderer extends RendererBase {

    angleY:number = 0

    camera:IEulerCamera

    async init() {
        this.setSize(400,400)

        this.camera = initializeEulerCamera({
            viewportWidth: this.width, 
            viewportHeight: this.height,
            pos: vec4(0,0,-100,1),
            dir: vec4(0,0,0,1),
            target: vec4(0,0,0,0),
            nearClipZ: 50,
            farClipZ: 500,
            fov: 90
        })        
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

        let cam = this.camera        

        let mper = Matrix4.identity()
        let mscr = Matrix4.identity()


        // let mrot = Matrix4.identity()

        // if(this.angleY > 0) {
        //     let cosTheta = Math.cos(this.angleY)
        //     let sinTheta = Math.sin(this.angleY)

        //     mrot = mat4x4(cosTheta, 0, -sinTheta, 0,
        //                   0,        1, 0        , 0,
        //                  sinTheta,  0, cosTheta,  0,
        //                  0,         0, 0,         1)
        // }

        //let mrot = rotateMatrixZAxis(this.angleY)
        let mrot = buildRotationMatrixEuler(0,this.angleY,0)

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

        let matCam = buildCameraMatrixEuler(cam);

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

            v.x = cam.viewDistance * (v.x/z)
            v.y = cam.viewDistance * (v.y/z)
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

        this.angleY+= 0.1

    }
}
