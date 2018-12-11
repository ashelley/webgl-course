import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import createMeshVAO, { VAO } from "../../shaders/createMeshVAO";
import Shader from "./shader";
import grid from "../../primatives/grid";
import Model from "../../primatives/Model";

export default class TestGridTransformation {

    gl:GLInstance
    renderLoop:RenderLoop
    shader:Shader
    model:Model

    constructor(gl:GLInstance) {
        this.gl = gl
        this.renderLoop = new RenderLoop(this.render)
    }

    init() {
        let gl = this.gl
        this.shader = new Shader(gl, [0.8,0.8,0.8, 1,0,0, 0,1,0, 0,0,1]) // Gray Red Green Blue

        let gridVao = grid(gl)

        this.model = new Model(gridVao)
    }

    start() {
        this.renderLoop.start()
    }

    render = (dt:number) => {
        this.gl.clear()

        let model = this.model

        let position = model.transform.position
        let angle = Math.atan2(position.y, position.x) + (3 * dt) //Calc the current angle plus 1 degree per second rotation
        let radius = Math.sqrt(position.x * position.x + position.y * position.y) //Calc the distance from origin.

        let scale = Math.max(1, Math.abs(Math.sin(angle)) * 1.2)

        let rotationX = 30 * dt
        let rotationY = 30 * dt
        let rotationZ = 90 * dt

        model.setScale(scale, scale, 1)
             .setPosition(radius * Math.cos(angle), radius * Math.sin(angle), 0)
             .addRotation(rotationX, rotationY, rotationZ)
             .preRender()
            
        this.shader.activate()
                   .renderModel(model)
    }
}