import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import { parseASCfile, ASCObject } from "../helpers/parseASCFile";
import { IEulerCamera, initializeEulerCamera, buildCameraMatrixEuler, cameraToPerspective, perspectiveToScreen } from '../primatives/Camera';
import { vec4, vec3 } from '../software_renderer/helpers';
import { buildRotationMatrixEuler, IRenderList, IRenderable, applyTransformationMatrix, applyTranslation } from '../helpers/math';
import { Colors } from '../primatives/Color';

export default class GURU8_8 extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }
}

let createRenderList = ():IRenderList => {
    return {
        vertices: [],
        transformedVertices: []
    }
}

let pushRenderable = (renderList:IRenderList, renderable:IRenderable) => {
    Array.prototype.push.apply(renderList.vertices, renderable.vertices)
    for(let i = 0; i < renderable.vertices.length; i++) {
        let vertex = renderList.vertices[i]
        renderList.transformedVertices.push({x:vertex.x,y:vertex.y,z:vertex.z,w:vertex.w})
    }
}


class Renderer extends RendererBase {

    camera:IEulerCamera
    sphere:ASCObject
    spherePos:{x:number,y:number,z:number} = vec3(0,0,0)

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
            pos: vec4(0,0,-100,1),
            dir: vec4(0,0,0,1),
            target: vec4(0,0,0,0),
            nearClipZ: 200,
            farClipZ: 12000,
        })            
    }

    doRenderWork() {
        let mcam = buildCameraMatrixEuler(this.camera)        

        let renderList = createRenderList()
        pushRenderable(renderList,this.sphere)

        let mrot = buildRotationMatrixEuler(0, 0, 0)


        applyTransformationMatrix(renderList.vertices,renderList.transformedVertices,mrot)
        applyTranslation(renderList.transformedVertices, renderList.transformedVertices,this.spherePos)
        applyTransformationMatrix(renderList.transformedVertices,renderList.transformedVertices, mcam)

        cameraToPerspective(renderList.transformedVertices, this.camera)
        perspectiveToScreen(renderList.transformedVertices, this.width, this.height)        

        this.drawWireFrame(renderList.transformedVertices)
    }

    drawWireFrame(vertices:{x:number,y:number,z:number}[]) {
        for(let i = 0; i < vertices.length - 3; i+=3) {
            let p0 = vertices[i]
            let p1 = vertices[i+1]
            let p2 = vertices[i+2]

            this.screenSpaceLine(p0.x,p0.y,p1.x,p1.y, Colors.WHITE)
            this.screenSpaceLine(p1.x,p1.y,p2.x,p2.y, Colors.WHITE)
            this.screenSpaceLine(p2.x,p2.y,p0.x,p0.y, Colors.WHITE)
        }
    }
}
