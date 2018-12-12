import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import createMeshVAO, { VAO } from "../../shaders/createMeshVAO";
import grid from "../../primatives/grid";
import Model from "../../primatives/Model";
import Camera from "../../primatives/Camera";
import CameraController from "../../primatives/CameraController";
import { GridAxisShader } from "./GridAxisShader";
import quad from "../../primatives/quad";
import { QuadShader } from "./QuadShader";

export default class QuadTest {

    gl:GLInstance
    renderLoop:RenderLoop
    
    gridShader:GridAxisShader
    grid:Model

    quadShader:QuadShader
    quad:Model

    camera:Camera
    cameraController:CameraController

    constructor(gl:GLInstance) {
        this.gl = gl
        this.renderLoop = new RenderLoop(this.render)
    }

    init() {
        let gl = this.gl

        gl.fitScreen(0.95, 0.9)

        this.camera = new Camera(gl)
        this.camera.transform.position.set(0,1,3)
        this.cameraController = new CameraController(gl, this.camera)

        this.gridShader = new GridAxisShader(gl, this.camera.projectionMatrix)
        let gridVao = grid(gl, true)
        this.grid = new Model(gridVao)

        this.quadShader = new QuadShader(gl, this.camera.projectionMatrix)

        let quadVao = quad(gl)

        this.quad = new Model(quadVao)
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

        this.quadShader.activate()
                    .setCameraMatrix(this.camera.viewMatrix)
                    .renderModel(this.quad.preRender())
    }
}