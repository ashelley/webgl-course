import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import createMeshVAO, { VAO } from "../../shaders/createMeshVAO";
import Shader from "./shader";
import createGrid from "../../primatives/grid";
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

        let gridVao = createGrid(gl)

        this.model = new Model(gridVao)
    }

    start() {
        this.renderLoop.start()
    }

    render = (dt:number) => {
        this.gl.clear()

        let model = this.model

        let position = model.transform.position
        let angle = Math.atan2(position.y, position.x) + (1 * dt) //Calc the current angle plus 1 degree per second rotation
        let radius = Math.sqrt(position.x * position.x + position.y * position.y) //Calc the distance from origin.

        let scale = Math.max(0.2, Math.abs(Math.sin(angle)) * 1.2)

        model.setScale(scale, scale / 4, 1)
             .setPosition(radius * Math.cos(angle), radius * Math.sin(angle), 0)
             .addRotation(30 * dt, 60 * dt, 15 * dt)
             .preRender()
            
        this.shader.activate()
                   .renderModel(model)
    }
}