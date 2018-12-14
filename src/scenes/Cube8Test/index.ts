import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import grid from "../../primatives/grid";
import Model from "../../primatives/Model";
import Camera from "../../primatives/Camera";
import CameraController from "../../primatives/CameraController";
import { GridAxisShader } from "./GridAxisShader";
import { TexturedCube8Shader } from "./TexturedCube8Shader";
import loadImage from "../../helpers/loadImage";
import cube8 from "../../primatives/cube8";

export default class Cube8Test {

    gl:GLInstance
    renderLoop:RenderLoop
    
    gridShader:GridAxisShader
    grid:Model

    cubeShader:TexturedCube8Shader
    cube8:Model

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

        let imgSrc = "images/uv_testpattern.png"
        let result = await loadImage(imgSrc)
        if(result == null) {
            throw new Error("Image failed to load: " + imgSrc)
        }

        let testPattern = gl.loadTexture("uv_testpattern", result.image);

        this.gridShader = new GridAxisShader(gl, this.camera.projectionMatrix)
        let gridVao = grid(gl, true)
        this.grid = new Model(gridVao)

        this.cubeShader = new TexturedCube8Shader(gl, this.camera.projectionMatrix)
        this.cubeShader.setTexture(testPattern)

        let cube8Vao = cube8(gl)
        this.cube8 = new Model(cube8Vao)
        //this.cube8.setPosition(0,0.6,0)
    }

    start() {
        this.renderLoop.start()
    }

    render = (dt:number) => {
        this.camera.updateViewMatrix()
        this.gl.clear()        
            
        this.gridShader.activate()
                   .setCameraMatrix(this.camera.viewMatrix)
                   .renderModel(this.grid.preRender())

        this.cubeShader.activate()
                    .preRender()
                    .setCameraMatrix(this.camera.viewMatrix)
                    .renderModel(this.cube8.preRender())
    }
}