import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import { parseASCfile, ASCObject } from "../helpers/parseASCFile";
import { IEulerCamera, initializeEulerCamera, buildCameraMatrixEuler, cameraToPerspective, perspectiveToScreen } from '../primatives/Camera';
import { vec4, vec3 } from '../software_renderer/helpers';
import { buildRotationMatrixEuler, IRenderList, IRenderable, applyTransformationMatrix, applyTranslation, subtract3d, cross, normalize, dot, multiplyColor, mat4x4, length3d } from '../helpers/math';
import { Colors, makeRGBColor, floatToRGBColor, makeFloatColor } from '../primatives/Color';

export default class GURU8_8 extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

let createRenderList = ():IRenderList => {
    return {
        vertices: [],
        transformedVertices: [],
        faceColors:[]
    }
}

let pushRenderable = (renderList:IRenderList, renderable:IRenderable) => {
    Array.prototype.push.apply(renderList.vertices, renderable.vertices)
    for(let i = 0; i < renderable.vertices.length; i++) {
        let vertex = renderList.vertices[i]
        renderList.transformedVertices.push({x:vertex.x,y:vertex.y,z:vertex.z,w:vertex.w})
    }
    for(let i = 0; i < renderable.faceBaseColors.length; i++) {
        let baseColor = renderable.faceBaseColors[i]
        renderList.faceColors.push({r:baseColor.r, g: baseColor.g, b: baseColor.b, a:baseColor.a})
    }
}


class Renderer extends RendererBase {

    camera:IEulerCamera
    sphere:ASCObject
    spherePos:{x:number,y:number,z:number} = vec3(0,0,0)
    sphereRotation:{x:number,y:number,z:number} = vec3(0,0,0)

    async init() {

        this.setSize(800,600)

        let ascSource = await loadTextFile({url: "models/sphere01.asc"})
        let parsedASC = parseASCfile(ascSource);    

        let sphere = parsedASC.objects[0]
        sphere.compileVertices({swapYZ: true, invertWindingOrder: true, scaleVerts: {x: 5, y: 5, z: 5}});

        this.sphere = sphere

        this.camera = initializeEulerCamera({
            viewportWidth: this.width, 
            viewportHeight: this.height,
            pos: vec4(0,0,-250,1),
            dir: vec4(0,0,0,1),
            target: vec4(0,0,0,0),
            nearClipZ: 200,
            farClipZ: 12000,
            fov: 120,
        })            
    }


    doRenderWork() {
        this.clear();
        this.setupZBuffer()

        let mcam = buildCameraMatrixEuler(this.camera)        

        let renderList = createRenderList()
        pushRenderable(renderList,this.sphere)


        let mrot = buildRotationMatrixEuler(this.sphereRotation.x, this.sphereRotation.y, this.sphereRotation.z)


        applyTransformationMatrix(renderList.vertices,renderList.transformedVertices,mrot)
        applyTranslation(renderList.transformedVertices, renderList.transformedVertices,this.spherePos)
        applyTransformationMatrix(renderList.transformedVertices,renderList.transformedVertices, mcam)

        cameraToPerspective(renderList.transformedVertices, this.camera)
        perspectiveToScreen(renderList.transformedVertices, this.width, this.height)        

        let ambientLightColor = makeFloatColor(0.1,0.1,0.1)

        addAmbientLight(renderList.transformedVertices, renderList.faceColors, ambientLightColor)

        let sunLightColor = makeFloatColor(0.7,0.7,0.7)
        let sunLightDir = vec3(-0.7,0,-0.7)

        addSunLight(renderList.transformedVertices,renderList.faceColors,sunLightDir, sunLightColor)


        //this.drawWireFrame(renderList.transformedVertices)
        this.drawShaded(renderList.transformedVertices, renderList.faceColors, this.camera.pos)

        this.sphereRotation.y += 0.01
    }

    drawShaded(vertices:{x:number,y:number,z:number}[], colors:{r:number,g:number,b:number,a:number}[], cameraPos:{x:number,y:number,z:number}) {
        for(let i = 0; i < vertices.length; i+=3) {
            let p0 = vertices[i+0]
            let p1 = vertices[i+1]
            let p2 = vertices[i+2]

            //TODO: precompute this before doing lighting
            if(isBackFace(p0,p1,p2, cameraPos)) continue;

            let color = colors[i/3]
            
            let rgbC = floatToRGBColor(color)
            this.triangleShaded(p0,p1,p2,rgbC)
            //this.triangleShadedZBuffer(p0,p1,p2, color)
        }
    }

    drawWireFrame(vertices:{x:number,y:number,z:number}[]) {
        for(let i = 0; i < vertices.length; i+=3) {
            let p0 = vertices[i]
            let p1 = vertices[i+1]
            let p2 = vertices[i+2]

            this.screenSpaceLine(p0.x,p0.y,p1.x,p1.y, Colors.RED)
            this.screenSpaceLine(p1.x,p1.y,p2.x,p2.y, Colors.RED)
            this.screenSpaceLine(p2.x,p2.y,p0.x,p0.y, Colors.RED)
        }
    }
}

let isBackFace = (p0:{x:number,y:number,z:number},p1:{x:number,y:number,z:number},p2:{x:number,y:number,z:number}, cameraPos:{x:number,y:number,z:number}) => {
    let u = subtract3d(p1,p0)
    let v = subtract3d(p2,p0)    
    let n = cross(u,v)

    normalize(n)

    //TODO: shouldn't we use center of face?
    let vectorToCamera = subtract3d(p0,cameraPos)

    normalize(vectorToCamera)

    let dp = dot(n,vectorToCamera) //TODO: do we need normalized vectors here?

    return dp > 0 //TODO: should be < 0 = backface why is this backwards right now?
}

let addAmbientLight = (vertices:{x:number,y:number,z:number}[], colors:{r:number,g:number,b:number,a:number}[], lightColor:{r:number,g:number,b:number}) => {
    for(let i = 0; i < vertices.length; i+=3) {
        let color = colors[i/3]

        color.r = color.r * lightColor.r
        color.g = color.g * lightColor.g
        color.b = color.b * lightColor.b

        color.r = Math.min(color.r,1)
        color.g = Math.min(color.r,1)
        color.b = Math.min(color.b,1)        
    }

}

let addSunLight = (vertices:{x:number,y:number,z:number}[], colors:{r:number,g:number,b:number,a:number}[], lightDir:{x:number,y:number,z:number}, lightColor:{r:number,g:number,b:number}) => {
    for(let i = 0; i < vertices.length; i+=3) {
        let p0 = vertices[i+0]
        let p1 = vertices[i+1]
        let p2 = vertices[i+2]
        let color = colors[i/3]

        let u = subtract3d(p1,p0)
        let v = subtract3d(p2,p0)

        let n = cross(u,v)

        let length = length3d(n)

        normalize(n)

        let dp = dot(n,lightDir)

        //TODO: i don't think this is right review intensity stuff
        let intensity = dp/length
        intensity = 1

        if(dp > 0) {
            color.r += lightColor.r * dp * intensity
            color.g += lightColor.g * dp * intensity
            color.b += lightColor.b * dp * intensity
        }

        color.r = Math.min(color.r,1)
        color.g = Math.min(color.r,1)
        color.b = Math.min(color.b,1)
    }
}
