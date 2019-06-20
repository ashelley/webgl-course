import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { loadTextFile } from "../helpers/loadFile";
import parseObjFile, { Obj } from "../helpers/parseObjFile";
import {  mat4x4, int } from "../helpers/math";
import Matrix4 from "../helpers/Matrix4";
import { Colors} from "../primatives/Color";
import React from "react";
import TestSimpleShading from "./TestSimpleShading";

let inchesTomm = (inches:number) => {
    return inches * 25.4
}

enum CameraFill {
    FILL = "fill",
    OVERSCAN = "overscan"
}

interface RendererState {
    fillMode:CameraFill,
    filmApertureWidth:number,
    filmApertureHeight:number    
}

export default class TestPinHole extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new Renderer(canvas, width, height)
    }

    getInitialState():RendererState {
        return {
            fillMode: CameraFill.FILL,
            filmApertureWidth: 0.980,
            filmApertureHeight: 0.735
        }
    }

    updateState(name:keyof RendererState, value:string) {    
        let newState:number|string = value
        if(name == "filmApertureWidth" || name == "filmApertureHeight") {
            newState = -1
            try {
                newState = parseFloat(value)
            }catch{
                return
            }            
            if(isNaN(newState) || newState <= 0) {
                return
            }
        }
        this.setState(state => {
            return {[name]: newState}
        })
    }

    handleChange = (name:keyof RendererState) => e => {
        let value = e.target.value
        this.updateState(name,value)
    }

    debugUI() {
        let renderer = this.renderer as Renderer        
        let state:RendererState = this.state as any
        if(renderer != null) {
            renderer.fillMode = state.fillMode
            renderer.filmApertureWidth = state.filmApertureWidth
            renderer.filmApertureHeight = state.filmApertureHeight
            renderer.updateCamera()
        }
        else {
            state = this.getInitialState()
        }
        return <div>
            <div><label>Aperature Width:</label><input type="text" onChange={this.handleChange('filmApertureWidth')} value={state.filmApertureWidth.toString()}></input></div>
            <div><label>Aperature Height:</label><input type="text" onChange={this.handleChange('filmApertureHeight')} value={state.filmApertureHeight.toString()}></input></div>
            <div><label>Fill Mode:</label>
                    <select value={state.fillMode} onChange={this.handleChange('fillMode')} >
                        <option value={CameraFill.FILL}>Fill</option>
                        <option value={CameraFill.OVERSCAN}>OVERSCAN</option>
                    </select>
            </div>
        </div>
    }        

}

class Renderer extends RendererBase {

    obj: Obj

    cameraToWorld:Float32Array
    worldToCamera:Float32Array

    canvasWidth:number = 2
    canvasHeight:number = 2    

    focalLength = 35 // mm
    //filmApertureWidth = 0.825 // inches    
    //filmApertureHeight = 0.446 // inches

    filmApertureWidth = 0.980 // inches
    filmApertureHeight = 0.735 // inches    

    nearClippingPlane = 0.1
    farClippingPlane = 1000
    
    filmAspectRatio:number
    deviceAspectRatio:number

    top:number
    bottom:number
    left:number
    right:number

    xScale:number
    yScale:number

    fillMode:CameraFill

    async init() {
        let objSource = await loadTextFile({url: "models/boat.obj"})
        //let objSource = await loadTextFile({url: "models/cube.obj"})
        //let objSource = await loadTextFile({ url: "models/siamese_cat_lowpoly.obj" })
        //let objSource = await loadTextFile({ url: "models/susan.obj" })
        this.obj = parseObjFile(objSource, { flipYUV: true, disableParseUvs: true, disableParseNormals: true })

        this.cameraToWorld = mat4x4(-0.95424, 0, 0.299041, 0, 0.0861242, 0.95763, 0.274823, 0, -0.28637, 0.288002, -0.913809, 0, -3.734612, 7.610426, -14.152769, 1)
        this.worldToCamera = new Float32Array(16)
        Matrix4.invert(this.worldToCamera, this.cameraToWorld)
            
        //this.setSize(640,480)

        this.updateCamera()        
    }

    updateCamera() {
        this.filmAspectRatio = this.filmApertureWidth / this.filmApertureHeight
        this.deviceAspectRatio = this.width / this.height

        this.top = ((inchesTomm(this.filmApertureHeight) / 2) / this.focalLength) * this.nearClippingPlane
        this.right = ((inchesTomm(this.filmApertureWidth) / 2) / this.focalLength) * this.nearClippingPlane

        this.xScale = 1
        this.yScale = 1

        if(this.fillMode == CameraFill.OVERSCAN) {
            if(this.filmAspectRatio > this.deviceAspectRatio) {
                this.yScale = this.filmAspectRatio / this.deviceAspectRatio                
            }
            else {
                this.xScale = this.deviceAspectRatio / this.filmAspectRatio
            }
        }
        else {
            if(this.filmAspectRatio > this.deviceAspectRatio) {
                this.xScale = this.deviceAspectRatio / this.filmAspectRatio                        
            }
            else {
                this.yScale = this.filmAspectRatio / this.deviceAspectRatio        
            }
        }

        this.right *= this.xScale
        this.top *= this.yScale

        this.bottom = -this.top
        this.left = -this.right
    }

    computePixelCoordinates(p:{x:number,y:number,z:number}, worldToCamera:Float32Array, 
                bottom:number,left:number,top:number,right:number,near:number,
                imageWidth:number, imageHeight:number):{x:number,y:number, visible:boolean} {
        
        let [cameraX,cameraY,cameraZ,cameraW] = Matrix4.multiplyVector(worldToCamera,[p.x,p.y,p.z,1])

        let screenX = cameraX / -cameraZ * near
        let screenY = cameraY / -cameraZ * near

        let ndcX = (screenX + right) / (2 * right)
        let ndcY = (screenY + top) / (2 * top)

        let rasterX = int(ndcX * imageWidth)
        let rasterY = int((1 - ndcY) * imageHeight)

        let visible = true

        if(screenX < left || screenX > right || screenY < bottom || screenY > top) {
            visible = false
        }

        return {x: rasterX, y: rasterY, visible}
    }

    doRenderWork() {
        let obj = this.obj
        let i = 0;
        let faces = obj.faces

        this.clear()

        while (i < faces.length) {
            let verts = faces[i].verts
            let objectX0 = verts[0]
            let objectY0 = verts[1]
            let objectZ0 = verts[2]
            let objectX1 = verts[3]
            let objectY1 = verts[4]
            let objectZ1 = verts[5]
            let objectX2 = verts[6]
            let objectY2 = verts[7]
            let objectZ2 = verts[8]       

            let v0Raster = this.computePixelCoordinates({x: objectX0, y: objectY0, z: objectZ0}, this.worldToCamera,
                                                            this.bottom, this.left, this.top, this.right, this.nearClippingPlane,
                                                            this.width, this.height)
            let v1Raster = this.computePixelCoordinates({x: objectX1, y: objectY1, z: objectZ1}, this.worldToCamera,
                                                            this.bottom, this.left, this.top, this.right, this.nearClippingPlane,
                                                            this.width, this.height)
            let v2Raster = this.computePixelCoordinates({x: objectX2, y: objectY2, z: objectZ2}, this.worldToCamera, 
                                                            this.bottom, this.left, this.top, this.right, this.nearClippingPlane,
                                                            this.width, this.height)

            let color = Colors.BLUE
            if(!v0Raster.visible || !v1Raster.visible || !v2Raster.visible) {
                color = Colors.RED
            }

            this.lineXY(v0Raster.x, this.height - v0Raster.y,v1Raster.x,this.height - v1Raster.y, color)
            this.lineXY(v1Raster.x, this.height - v1Raster.y,v2Raster.x,this.height - v2Raster.y, color)
            this.lineXY(v2Raster.x, this.height - v2Raster.y,v0Raster.x,this.height - v0Raster.y, color)

            i++
        }
    }
}
