import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import grid from "../../primatives/grid";
import Model from "../../primatives/Model";
import Camera from "../../primatives/Camera";
import CameraController from "../../primatives/CameraController";
import { GridAxisShader } from "./GridAxisShader";
import loadImage from "../../helpers/loadImage";
import cube from "../../primatives/cube";
import { TexturedCubeShader } from "./TexturedCubeShader";

export default class CubeTest {

    gl:GLInstance
    renderLoop:RenderLoop
    
    gridShader:GridAxisShader
    grid:Model

    cubeShader:TexturedCubeShader
    cube:Model

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

        let imgSrc = "images/UV_Grid_Lrg.jpg"
        let result = await loadImage(imgSrc)
        if(result == null) {
            throw new Error("Image failed to load: " + imgSrc)
        }

        let testPattern = gl.loadTexture("UV_Grid_Lrg", result.image);

        this.gridShader = new GridAxisShader(gl, this.camera.projectionMatrix)
        let gridVao = grid(gl, true)
        this.grid = new Model(gridVao)

        this.cubeShader = new TexturedCubeShader(gl, this.camera.projectionMatrix)
        this.cubeShader.setTexture(testPattern)

        let cubeVao = cube(gl, 1,1,1,0,0,0)
        this.cube = new Model(cubeVao)
    }

    start() {
        this.renderLoop.start()
    }

    render = (dT:number) => {
        this.camera.updateViewMatrix()
        this.gl.clear()        
            
        this.gridShader.activate()
                   .setCameraMatrix(this.camera.viewMatrix)
                   .renderModel(this.grid.preRender())

        this.cubeShader.activate()
                    .preRender()
                    .setCameraMatrix(this.camera.viewMatrix)
                    .setTime(performance.now())                            
                    .renderModel(this.cube.preRender())
    }
}