import GLInstance from "../../GLInstance";

import RenderLoop from "../../RenderLoop";
import createMeshVAO, { VAO } from "../../shaders/createMeshVAO";
import Shader from "./shader";

export default class SimpleVAO {

    gl:GLInstance
    renderLoop:RenderLoop
    dotsVAO:VAO
    shader:Shader

    pointSize	= 0
    sizeStep	= 3
    angle		= 0
    angleStep	= (Math.PI / 180.0) * 90

    constructor(gl:GLInstance) {
        this.gl = gl
        this.renderLoop = new RenderLoop(this.render)
    }

    init() {
        let gl = this.gl
        let glContext = gl.glContext

        let verticies = new Float32Array([ 0.0, 0.0, 0.0, 
                                           0.1, 0.1, 0.0, 
                                           0.1,-0.1, 0.0, 
                                          -0.1,-0.1, 0.0, 
                                          -0.1, 0.1, 0.0])

        this.shader = new Shader(gl)

        this.dotsVAO = createMeshVAO(glContext,"dots", null, verticies)
        this.dotsVAO.drawMode = glContext.POINTS
        
    }

    start() {
        this.renderLoop.start()
    }

    render = (dt:number) => {
        let gl = this.gl        
        let shader = this.shader
        
        gl.clear()

        this.pointSize += this.sizeStep * dt

        let pointSize = Math.sin(this.pointSize) * 10.0 + 30.0
        
        this.angle += this.angleStep * dt

        shader.activate()
              .set(pointSize, this.angle)
              .render(this.dotsVAO)
        
    }
}