import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import createMeshVAO, { VAO } from "../../shaders/createMeshVAO";
import Shader from "./shader";
import grid from "../../primatives/grid";

export default class SimpleVAOGrid {

    gl:GLInstance
    renderLoop:RenderLoop
    shader:Shader
    grid:Partial<VAO>

    constructor(gl:GLInstance) {
        this.gl = gl
        this.renderLoop = new RenderLoop(this.render)
    }

    init() {
        let gl = this.gl
        this.shader = new Shader(gl, [0.8,0.8,0.8, 1,0,0, 0,1,0, 0,0,1]) // Gray Red Green Blue
        debugger
        this.grid = grid(gl)                
    }

    start() {
        this.renderLoop.start()
    }

    render = (dt:number) => {
        this.gl.clear()
        this.shader.activate()
                   .render(this.grid)
    }
}