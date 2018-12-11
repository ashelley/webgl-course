import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import createMeshVAO, { VAO } from "../../shaders/createMeshVAO";
import grid from "../../primatives/grid";
import Model from "../../primatives/Model";
import Camera from "../../primatives/Camera";
import CameraController from "../../primatives/CameraController";
import { GridAxisShader } from "./GridAxisShader";

export default class TestMouseController {

    gl:GLInstance
    renderLoop:RenderLoop
    shader:GridAxisShader
    model:Model
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

        this.shader = new GridAxisShader(gl, this.camera.projectionMatrix)

        let gridVao = grid(gl, true)

        this.model = new Model(gridVao)
    }

    start() {
        this.renderLoop.start()
    }

    render = (dt:number) => {
        this.camera.updateViewMatrix()
        this.gl.clear()        

        //this.model.preRender()
            
        this.shader.activate()
                   .setCameraMatrix(this.camera.viewMatrix)
                   .renderModel(this.model.preRender())
    }
}