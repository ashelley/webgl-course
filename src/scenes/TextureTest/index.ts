import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import grid from "../../primatives/grid";
import Model from "../../primatives/Model";
import Camera from "../../primatives/Camera";
import CameraController from "../../primatives/CameraController";
import { GridAxisShader } from "./GridAxisShader";
import quad from "../../primatives/quad";
import { TexturedQuadShader } from "./TexturedQuadShader";
import loadImage from "../../helpers/loadImage";

export default class TextureTest {

    gl:GLInstance
    renderLoop:RenderLoop
    
    gridShader:GridAxisShader
    grid:Model

    quadShader:TexturedQuadShader
    quad:Model

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

        this.quadShader = new TexturedQuadShader(gl, this.camera.projectionMatrix)

        this.quadShader.setTexture(testPattern)

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
                    .preRender()
                    .setCameraMatrix(this.camera.viewMatrix)
                    .renderModel(this.quad.preRender())
    }
}