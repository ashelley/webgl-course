import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import { parseASCfile, ASCObject } from "../helpers/parseASCFile";
import { IEulerCamera, initializeEulerCamera, buildCameraMatrixEuler, cameraToPerspective, perspectiveToScreen } from '../primatives/Camera';
import { vec4, vec3 } from '../software_renderer/helpers';
import { buildRotationMatrixEuler, IRenderList, IRenderable, applyTransformationMatrix, applyTranslation, subtract3d, cross, normalize, dot, multiplyColor, mat4x4, length3d, barycentric, scale3d, multiply3d, add3d, IRenderGroup, clampMax } from '../helpers/math';
import { Colors, makeRGBColor, floatToRGBColor, makeFloatColor } from '../primatives/Color';
import cube from '../primatives/cube';
import { number } from 'prop-types';

export default class GURU8_8 extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

let createRenderGroup = ():IRenderGroup => {
    return {
        numVertices: 0,
        numFaces: 0,
        worldSpaceVertices:[],        
        transformedVertices:[],    
        faceNormals:[],    
        vertexNormals:[],    
        faceBaseColors:[],
        calculatedFaceColors:[],
        isBackFace:[] //TODO should we integrate calculatedFaceColors + isBackFace into a single per face thingy
    }
}

let pushRenderable = (renderGroup:IRenderGroup, renderable:IRenderable) => {
    let numVerticies = renderable.vertices.length;
    let numFaces = numVerticies / 3
    for(let i = 0; i < renderable.vertices.length; i++) {
        let vertex = renderable.vertices[i]
        renderGroup.worldSpaceVertices.push({x:vertex.x,y:vertex.y,z:vertex.z,w:vertex.w})        
    }
    for(let i = 0; i < numFaces; i++) {
        let baseColor = renderable.faceBaseColors[i]
        //TODO: should we make colors just a uint32 for perf?
        renderGroup.faceBaseColors.push({r:baseColor.r, g: baseColor.g, b: baseColor.b, a:baseColor.a})
        renderGroup.calculatedFaceColors.push({r: 0, g: 0, b: 0, a: 0})
    }
    renderGroup.numVertices += numVerticies
    renderGroup.numFaces += numFaces    
}

let prepareRenderGroupForRendering = (renderGroup:IRenderGroup, camPos:{x:number,y:number,z:number}) => {
    for(let i = 0; i < renderGroup.numVertices; i++) {
        let vertex = renderGroup.worldSpaceVertices[i]
        //TODO: calculate per vertex normals?
        renderGroup.transformedVertices.push({x:vertex.x,y:vertex.y,z:vertex.z,w:vertex.w})        
    }    
    for(let i = 0, f = 0; i < renderGroup.numVertices; i+=3, f++) {
        let p0 = renderGroup.worldSpaceVertices[i]
        let p1 = renderGroup.worldSpaceVertices[i+1]
        let p2 = renderGroup.worldSpaceVertices[i+2]
        
        let n = calcNormal(p0,p1,p2,true) //TODO: normalize?        
        let c = centroid(p0,p1,p2)

        let backFacing = isBackFace(n,c,camPos)

        renderGroup.faceNormals[f] = n
        renderGroup.isBackFace[f] = backFacing
    }    
}


class Renderer extends RendererBase {

    camera:IEulerCamera
    sphere:ASCObject
    spherePos:{x:number,y:number,z:number} = vec3(0,0,0)
    sphereRotation:{x:number,y:number,z:number} = vec3(0,6,0)

    async init() {

        this.setSize(800,600)

        let ascSource = await loadTextFile({url: "models/sphere01.asc"})
        let parsedASC = parseASCfile(ascSource);    

        let sphere = parsedASC.objects[0]
        sphere.compileVertices({swapYZ: true, invertWindingOrder: false, scaleVerts: {x: 5, y: 5, z: 5}});

        this.sphere = sphere

        this.camera = initializeEulerCamera({
            viewportWidth: this.width, 
            viewportHeight: this.height,
            pos: vec4(0,0,-100,1),
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

        let renderGroup = createRenderGroup()
        pushRenderable(renderGroup,this.sphere)


        let mrot = buildRotationMatrixEuler(this.sphereRotation.x, this.sphereRotation.y, this.sphereRotation.z)

        applyTransformationMatrix(renderGroup.worldSpaceVertices,mrot)
        applyTranslation(renderGroup.worldSpaceVertices,this.spherePos)

        prepareRenderGroupForRendering(renderGroup, this.camera.pos)

        applyTransformationMatrix(renderGroup.transformedVertices, mcam)

        cameraToPerspective(renderGroup.transformedVertices, this.camera)
        perspectiveToScreen(renderGroup.transformedVertices, this.width, this.height)        

        let ambientLightColor = makeFloatColor(0.1,0.1,0.1)

        addAmbientLight(renderGroup, ambientLightColor)

        let sunLightColor = makeFloatColor(0.2,0.2,0.7)
        let sunLightDir = vec3(-0.7,0,-0.7)

        addSunLight(renderGroup,sunLightDir, sunLightColor)


        this.drawShaded(renderGroup, this.camera.pos)
        this.drawWireFrame(renderGroup, this.camera.pos)        

        this.sphereRotation.y += 0.01
        this.sphereRotation.x += 0.01
    }

    drawShaded(renderGroup:IRenderGroup, cameraPos:{x:number,y:number,z:number}) {
        for(let i = 0, f = 0; i < renderGroup.numVertices; i+=3, f++) {
            
            let backFacing = renderGroup.isBackFace[f]
            if(backFacing) continue
            
            let color = renderGroup.calculatedFaceColors[f]
            let normal = renderGroup.faceNormals[f]

            let p0 = renderGroup.transformedVertices[i+0]
            let p1 = renderGroup.transformedVertices[i+1]
            let p2 = renderGroup.transformedVertices[i+2]
            
            let rgbC = floatToRGBColor(color)
            this.triangleShaded(p0,p1,p2,rgbC)

            //this.triangleShadedZBuffer(p0,p1,p2, color)

            let c = centroid(p0,p1,p2)

            this.drawPoint(c.x,c.y,2,Colors.RED)


            let normalLineEnd = add3d(c,scale3d(normal,50))

             this.screenSpaceLine(c.x,c.y,normalLineEnd.x,normalLineEnd.y, Colors.GREEN)
        }
    }

    drawWireFrame(renderGroup:IRenderGroup, cameraPos:{x:number,y:number,z:number}) {
        for(let i = 0,f=0; i < renderGroup.numVertices; i+=3,f++) {

            let backFacing = renderGroup.isBackFace[f]
            if(backFacing) continue            
            
            let p0 = renderGroup.transformedVertices[i+0]
            let p1 = renderGroup.transformedVertices[i+1]
            let p2 = renderGroup.transformedVertices[i+2]

            let color = Colors.WHITE

            this.screenSpaceLine(p0.x,p0.y,p1.x,p1.y, color)
            this.screenSpaceLine(p1.x,p1.y,p2.x,p2.y, color)
            this.screenSpaceLine(p2.x,p2.y,p0.x,p0.y, color)


        }
    }
}

let centroid = (p0:{x:number,y:number,z:number},p1:{x:number,y:number,z:number},p2:{x:number,y:number,z:number}) => {
    let cX = (p0.x + p1.x + p2.x) / 3
    let cY = (p0.y + p1.y + p2.y) / 3 
    let cZ = (p0.z + p1.z + p2.z) / 3
    return {x:cX,y:cY,z:cZ}    
}

let calcNormal = (p0:{x:number,y:number,z:number},p1:{x:number,y:number,z:number},p2:{x:number,y:number,z:number}, doNormalize:boolean) => {
    let u = subtract3d(p1,p0)
    let v = subtract3d(p2,p0)    
    let n = cross(u,v)

    if(doNormalize) {
        normalize(n)
    }
    return n
}

let isBackFace = (normal:{x:number,y:number,z:number},fromPos:{x:number,y:number,z:number}, cameraPos:{x:number,y:number,z:number}) => {
    let vectorToCamera = subtract3d(fromPos,cameraPos)

    normalize(vectorToCamera) 

    let dp = dot(normal,vectorToCamera) //TODO: do we need normalized vectors here?

    return dp > 0 //TODO: should be < 0 = backface why is this backwards right now?
}

let addAmbientLight = (renderGroup:IRenderGroup, lightColor:{r:number,g:number,b:number}) => {

    for(let i = 0; i < renderGroup.numFaces; i++) {
        let baseColor = renderGroup.faceBaseColors[i]

        let r = baseColor.r * lightColor.r
        let g = baseColor.g * lightColor.g
        let b = baseColor.b * lightColor.b

        let a = baseColor.a
        
        //TODO: should this be 0-255
        r = clampMax(r,1)
        g = clampMax(g,1)
        b = clampMax(b,1)        

        renderGroup.calculatedFaceColors[i] = {r,g,b,a}
    }

}

let addSunLight = (renderGroup:IRenderGroup, lightDir:{x:number,y:number,z:number}, lightColor:{r:number,g:number,b:number}) => {
    for(let i = 0, f = 0; i < renderGroup.numVertices; i+=3,f++) {        
        let color = renderGroup.calculatedFaceColors[f]
        let normal = renderGroup.faceNormals[f]

        let dp = dot(normal,lightDir)

        //TODO: i don't think this is right review intensity stuff
        let intensity = dp/length
        intensity = 1

        if(dp > 0) {
            color.r += lightColor.r * dp * intensity
            color.g += lightColor.g * dp * intensity
            color.b += lightColor.b * dp * intensity
        }

        color.r = clampMax(color.r,1)
        color.g = clampMax(color.r,1)
        color.b = clampMax(color.b,1)
    }
}
