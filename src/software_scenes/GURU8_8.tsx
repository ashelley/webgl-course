import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import { parseASCfile, ASCObject } from "../helpers/parseASCFile";
import { IEulerCamera, initializeEulerCamera, buildCameraMatrixEuler, cameraToPerspective, perspectiveToScreen } from '../primatives/Camera';
import { vec4, vec3 } from '../software_renderer/helpers';
import { buildRotationMatrixEuler, applyTransformationMatrix, applyTranslation, subtract3d, cross, normalize, dot, multiplyColor, mat4x4, length3d, barycentric, scale3d, multiply3d, add3d, clampMax, centroid, rotateMatrixXAxis } from '../helpers/math';
import { Colors, makeRGBColor, floatToRGBColor, makeFloatColor } from '../primatives/Color';
import cube from '../primatives/cube';
import { number } from 'prop-types';
import { addSunLight, addAmbientLight, prepareRenderGroupForRendering, createRenderGroup, pushRenderable, IRenderGroup, IPointLight, addPointLight } from '../helpers/rendering';
import React from 'react';

interface SceneOptions {
    renderWireFrame: boolean
    renderNormals: boolean
    rotateX:boolean
    rotateY:boolean
    rotateZ:boolean
}

export default class GURU8_8 extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }

    getInitialState():SceneOptions {
        return {
            renderWireFrame: false,
            renderNormals: false,
            rotateX: false,
            rotateY: false,
            rotateZ: false
        }
    }

    toggleBoolean = (option:keyof SceneOptions) => e => {
        e.stopPropagation()
        e.preventDefault()
        this.setState(state => {
            return {
                [option]: !state[option]
            }
        })
    }

    debugUI(state:SceneOptions) {
        let renderer = this.renderer as Renderer        
        if(renderer != null) {
            renderer.renderWireFrame = state.renderWireFrame
            renderer.renderNormals = state.renderNormals
            renderer.rotateX = state.rotateX
            renderer.rotateY = state.rotateY
            renderer.rotateZ = state.rotateZ    
        }
        return <>
            <div>
                <button onClick={this.toggleBoolean('renderWireFrame')}>Toggle WireFrame {state.renderWireFrame ? "Off": "On"}</button>
            </div>
            <div>
                <button onClick={this.toggleBoolean('renderNormals')}>Toggle Normals {state.renderNormals ? "Off": "On"}</button>
            </div>   
            <div>
                <button onClick={this.toggleBoolean('rotateX')}>Toggle Roatate X {state.rotateX ? "Off": "On"}</button>
            </div>                      
            <div>
                <button onClick={this.toggleBoolean('rotateY')}>Toggle Roatate Y {state.rotateY ? "Off": "On"}</button>
            </div>                      
            <div>
                <button onClick={this.toggleBoolean('rotateZ')}>Toggle Roatate Z {state.rotateZ ? "Off": "On"}</button>
            </div>                                              
        </>
    }      

}

class Renderer extends RendererBase {

    renderWireFrame = false
    renderNormals = false
    rotateX = false
    rotateY = false
    rotateZ = false

    camera:IEulerCamera
    sphere:ASCObject
    spherePos:{x:number,y:number,z:number} = vec3(0,0,0)
    sphereRotation:{x:number,y:number,z:number} = vec3(0,6,0)
    pointLight:IPointLight
    pointLightAngle = 0

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
            pos: vec4(0,0,-150,1),
            dir: vec4(0,0,0,1),
            target: vec4(0,0,0,0),
            nearClipZ: 200,
            farClipZ: 12000,
            fov: 120,
        })            

        this.pointLight = {
            pos: vec3(0,200,0),
            color: makeFloatColor(0,1,0),
            constantAttenuation: 0,
            linearAttenuation: 0.001,
            quadraticAttenuation: 0
        }        
    }

    doLighting(renderGroup:IRenderGroup, deltaMS:number) {
        // move point light source in ellipse around game world
        let pointLightPos = this.pointLight.pos
        let pointLightAngle = this.pointLightAngle
        pointLightPos.x = 300 * Math.cos(pointLightAngle)
        pointLightPos.y = -200
        pointLightPos.z = 300 * Math.sin(pointLightAngle)

        pointLightAngle += 3 * deltaMS
        if(pointLightAngle > 360) pointLightAngle = 0
        this.pointLightAngle = pointLightAngle        
        

        let ambientLightColor = makeFloatColor(0.1,0.1,0.1)

        addAmbientLight(renderGroup, ambientLightColor)

        let sunLightColor = makeFloatColor(0.2,0.2,0.7)
        let sunLightDir = vec3(-0.7,0,-0.7)

        addSunLight(renderGroup,sunLightDir, sunLightColor)

        addPointLight(renderGroup, this.pointLight)                
    }


    doRenderWork(deltaMS) {
        this.clear();
        this.setupZBuffer()

        let mcam = buildCameraMatrixEuler(this.camera)        

        let renderGroup = createRenderGroup()
        pushRenderable(renderGroup,this.sphere)

        let mrot = buildRotationMatrixEuler(this.sphereRotation.x, this.sphereRotation.y, this.sphereRotation.z)

        applyTransformationMatrix(renderGroup.worldSpaceVertices,mrot)
        applyTranslation(renderGroup.worldSpaceVertices,this.spherePos)

        prepareRenderGroupForRendering(renderGroup, this.camera.pos)      
        
        this.doLighting(renderGroup,deltaMS)

        applyTransformationMatrix(renderGroup.transformedVertices, mcam)

        cameraToPerspective(renderGroup.transformedVertices, this.camera)
        perspectiveToScreen(renderGroup.transformedVertices, this.width, this.height)        


        this.drawShaded(renderGroup, this.camera.pos)
        
        if(this.renderWireFrame) {
            this.drawWireFrame(renderGroup, this.camera.pos)        
        }


        if(this.rotateX) {
            this.sphereRotation.x -= 0.5 * deltaMS
        }

        if(this.rotateY) {
            this.sphereRotation.y -= 0.5 * deltaMS
        }
        
        if(this.rotateZ) {
            this.sphereRotation.z -= 0.5 * deltaMS
        }
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

            if(this.renderNormals) {
                let c = centroid(p0,p1,p2)            
                this.drawPoint(c.x,c.y,2,Colors.WHITE)


                {
                    let normalLineEnd = add3d(c,scale3d(normal,25))
                    this.screenSpaceLine(c.x,c.y,normalLineEnd.x,normalLineEnd.y, Colors.YELLOW)
                }

                // {
                //     let normalLineEnd = add3d(p0,scale3d(normal,50))
                //     this.screenSpaceLine(p0.x,p0.y,normalLineEnd.x,normalLineEnd.y, Colors.RED)
                // }            

                // {
                //     let normalLineEnd = add3d(p1,scale3d(normal,50))
                //     this.screenSpaceLine(p1.x,p1.y,normalLineEnd.x,normalLineEnd.y, Colors.GREEN)
                // }             

                // {
                //     let normalLineEnd = add3d(p2,scale3d(normal,50))
                //     this.screenSpaceLine(p2.x,p2.y,normalLineEnd.x,normalLineEnd.y, Colors.BLUE)
                // }              
            }           
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
