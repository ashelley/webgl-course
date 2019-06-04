import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import grid from "../../primatives/grid";
import Model from "../../primatives/Model";
import Camera from "../../primatives/Camera";
import CameraController from "../../primatives/CameraController";
import { GridAxisShader } from "./GridAxisShader";
import { loadImages } from "../../helpers/loadImage";
import loadCubeMap from "../../shaders/loadCubeMap";
import { CubeMapShader } from "./CubeMapShader";
import Matrix4 from "../../helpers/Matrix4";
import { loadTextFile } from "../../helpers/loadFile";
import parseObjFile from "../../helpers/parseObjFile";
import createObjVAO from "../../shaders/createObjVAO";
import { LitModelShader } from "./LitModelShader";
import cube from "../../primatives/cube";
import VertexDebugger from "../../shaders/VertexDebugger";
import scaleNumberIntoRange from "../../helpers/scaleNumberIntoRange";

interface LightState {
    radius:number   //Radius from the center to rotate the light
    angle:number    //Main Angle var for Light
    angleInc:number //How much to move per second
    yPos:number     //Current Position of light
    yPosInc:number  //How fast to move light vertically per secomd
}

export default class PhongLighting {

    gl:GLInstance
    renderLoop:RenderLoop
    
    gridShader:GridAxisShader
    grid:Model

    modelShader:LitModelShader
    model:Model

    skyMapShader:CubeMapShader
    skyMap:Model

    debugLight:VertexDebugger

    camera:Camera
    cameraController:CameraController

    lightState:LightState = {
        radius: 1.5,
        angle: 0,
        angleInc: 1,
        yPos: 0,
        yPosInc: 0
    }

    constructor(gl:GLInstance) {
        this.gl = gl
        this.renderLoop = new RenderLoop(this.render)
    }

    async init() {
        let gl = this.gl

        gl.fitScreen(0.95, 0.9).clear()

        this.camera = new Camera(gl)
        this.camera.transform.position.set(0,1,3)
        this.cameraController = new CameraController(gl, this.camera)

        //https://learnopengl.com/#!Advanced-OpenGL/Cubemaps


        let imagesToLoad = {
            'siamese-cat': "images/cat_tex512.png",
            'day-back': 'images/skymap-miramar/miramar_back.png',
            'day-front': 'images/skymap-miramar/miramar_front.png',
            'day-bottom': 'images/skymap-miramar/miramar_bottom.png',
            'day-left': 'images/skymap-miramar/miramar_left.png',
            'day-right': 'images/skymap-miramar/miramar_right.png',
            'day-top': 'images/skymap-miramar/miramar_top.png',
            'night-back': 'images/skymap-grimmnight/grimmnight_back.png',
            'night-front': 'images/skymap-grimmnight/grimmnight_front.png',
            'night-bottom': 'images/skymap-grimmnight/grimmnight_bottom.png',
            'night-left': 'images/skymap-grimmnight/grimmnight_left.png',
            'night-right': 'images/skymap-grimmnight/grimmnight_right.png',
            'night-top': 'images/skymap-grimmnight/grimmnight_top.png',            
        }

        let loadedImagesReq = loadImages(imagesToLoad)
        let siameseCatObjSourceReq = loadTextFile({url: "models/siamese_cat_lowpoly.obj"})

        let loadedImages = await loadedImagesReq
        let siameseCatObjSource = await siameseCatObjSourceReq

        let dayCubeMap = loadCubeMap(gl.glContext, "skymap-miramar", [
            loadedImages['day-right'],
            loadedImages['day-left'],
            loadedImages['day-top'],
            loadedImages['day-bottom'],
            loadedImages['day-back'],
            loadedImages['day-front'],
        ])

        let nightCubeMap = loadCubeMap(gl.glContext, "skymap-grimmnight", [
            loadedImages['night-right'],
            loadedImages['night-left'],
            loadedImages['night-top'],
            loadedImages['night-bottom'],
            loadedImages['night-back'],
            loadedImages['night-front'],
        ])        

        this.gridShader = new GridAxisShader(gl, this.camera.projectionMatrix)
        let gridVAO = grid(gl, true)
        this.grid = new Model(gridVAO)

        this.modelShader = new LitModelShader(gl, this.camera.projectionMatrix)        
        let siameseCatTexture = gl.loadTexture('siamese-cat', loadedImages['siamese-cat'])        
        let siameseCatObjParsed = parseObjFile(siameseCatObjSource, true)
        let siameseCatObjVAO = createObjVAO(gl.glContext, "siamese-cat", siameseCatObjParsed)
        this.model = new Model(siameseCatObjVAO)
        this.model.setScale(0.25,0.25,0.25)        

        // let modelVAO = cube(this.gl)
        // this.model = new Model(modelVAO)

        this.modelShader.setTexture(siameseCatTexture)


        let skymapVAO = cube(gl,10,10,10)
        this.skyMap = new Model(skymapVAO)    
        
        this.skyMapShader = new CubeMapShader(gl, this.camera.projectionMatrix)        
        this.skyMapShader.setDayTexture(dayCubeMap)
        this.skyMapShader.setNightTexture(nightCubeMap)

        this.debugLight = new VertexDebugger(gl.glContext, 10)
                .addColor("#FF0000")
                .addPoint(0,0,0,0)
                .finalize()
    }

    start() {
        this.renderLoop.start()
    }

    render = (dT:number) => {
        this.camera.updateViewMatrix()
        this.gl.clear()        

        this.skyMapShader.activate()
                    .preRender()
                    .setCameraMatrix(Matrix4.removeTranslation(this.camera.viewMatrix))
                    .setTime(performance.now())
                    .renderModel(this.skyMap)
            
        this.gridShader.activate()
                   .setCameraMatrix(this.camera.viewMatrix)
                   .renderModel(this.grid.preRender())



        let lightState = this.lightState

        lightState.angle += lightState.angleInc * dT
        lightState.yPos += lightState.yPosInc * dT

        let x = lightState.radius * Math.cos(lightState.angle)
        let y = scaleNumberIntoRange(Math.sin(lightState.yPos),-1,1,0.1,2)
        let z = lightState.radius * Math.sin(lightState.angle)

        this.debugLight.transform.position.set(x,y,z)                

        this.modelShader.activate()
                    .preRender()
                    .setCameraMatrix(this.camera.viewMatrix)
                    .setCameraPosition(this.camera.transform)
                    .setLightPos(this.debugLight.transform)
                    .renderModel(this.model.preRender())

        this.debugLight.render(this.camera)
    }
}