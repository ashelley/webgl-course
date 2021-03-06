import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import grid from "../../primatives/grid";
import Model from "../../primatives/Model";
import Camera from "../../primatives/Camera";
import CameraController from "../../primatives/CameraController";
import { GridAxisShader } from "./GridAxisShader";
import { loadImages } from "../../helpers/loadImage";
import cube from "../../primatives/cube";
import { TexturedCubeShader } from "./TexturedCubeShader";
import loadCubeMap from "../../shaders/loadCubeMap";
import { CubeMapShader } from "./CubeMapShader";
import Matrix4 from "../../helpers/Matrix4";
import { loadTextFile } from "../../helpers/loadFile";
import parseObjFile from "../../helpers/parseObjFile";
import createMeshVAO from "../../shaders/createMeshVAO";
import createObjVAO from "../../shaders/createObjVAO";
import { TexturedModelShader } from "./TexturedModelShader";

export default class ObjTest {

    gl:GLInstance
    renderLoop:RenderLoop
    
    gridShader:GridAxisShader
    grid:Model

    cubeShader:TexturedCubeShader
    cube:Model    
    cubeObj:Model

    modelShader:TexturedModelShader
    pirateGirl:Model
    pirateGirlTexture:WebGLTexture
    susan:Model

    skyMapShader:CubeMapShader
    skyMap:Model

    camera:Camera
    cameraController:CameraController

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
            'uv-grid': "images/UV_Grid_Lrg.jpg",
            'pirate-girl': "images/pirate_girl.png",
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
        let pirateGirlObjSourceReq = loadTextFile({url: "models/pirate_girl.obj"})
        let cubeObjSourceReq = loadTextFile({url: "models/cube.obj"})
        let susanObjSourceReq = loadTextFile({url: "models/susan.obj"})

        let loadedImages = await loadedImagesReq
        let pirateGirlObjSource = await pirateGirlObjSourceReq
        let cubeObjSource = await cubeObjSourceReq
        let susanObjSource = await susanObjSourceReq

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

        let testPattern = gl.loadTexture('uv-grid', loadedImages['uv-grid']);
        this.pirateGirlTexture = gl.loadTexture('pirate-girl', loadedImages['pirate-girl'])

        this.gridShader = new GridAxisShader(gl, this.camera.projectionMatrix)
        let gridVAO = grid(gl, true)
        this.grid = new Model(gridVAO)

        this.cubeShader = new TexturedCubeShader(gl, this.camera.projectionMatrix)
        this.cubeShader.setTexture(testPattern)
        
        let cubeVAO = cube(gl,1,1,1,2, 0, -1)
        this.cube = new Model(cubeVAO)

        let cubeObjParsed = parseObjFile(cubeObjSource, {flipYUV: true})
        let cubeObjVAO = createObjVAO(gl.glContext, "cube-obj", cubeObjParsed)
        cubeObjVAO.noCulling = true
        this.cubeObj = new Model(cubeObjVAO)
        //this.cubeObj.setPosition(2,0,-1)
        this.cubeObj.setScale(0.5,0.5,0.5)


        let pirateGirlObjParsed = parseObjFile(pirateGirlObjSource, {flipYUV: true})
        let pirateGirlObjVAO = createObjVAO(gl.glContext, "pirate-girl", pirateGirlObjParsed)
        this.pirateGirl = new Model(pirateGirlObjVAO)
        this.pirateGirl.setScale(0.5,0.5,0.5)

        let susanObjParsed = parseObjFile(susanObjSource, {flipYUV: true})
        let susanObjVAO = createObjVAO(gl.glContext, "susan", susanObjParsed)
        this.susan = new Model(susanObjVAO)
        this.susan.setScale(0.5,0.5,0.5)        

        this.modelShader = new TexturedModelShader(gl, this.camera.projectionMatrix)
        this.modelShader.setTexture(this.pirateGirlTexture)


        let skymapVAO = cube(gl,10,10,10)
        this.skyMap = new Model(skymapVAO)    
        
        this.skyMapShader = new CubeMapShader(gl, this.camera.projectionMatrix)        
        this.skyMapShader.setDayTexture(dayCubeMap)
        this.skyMapShader.setNightTexture(nightCubeMap)
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

        this.cubeShader.activate()
                    .preRender()
                    .setCameraMatrix(this.camera.viewMatrix)
                    .setTime(performance.now())                            
                    .renderModel(this.cube.preRender())
                    .renderModel(this.cubeObj.preRender())

        this.modelShader.activate()
                    .preRender()
                    .setCameraMatrix(this.camera.viewMatrix)
                    .renderModel(this.pirateGirl.preRender())
                    //.setTexture(null)
                    .renderModel(this.susan.preRender())
    }
}