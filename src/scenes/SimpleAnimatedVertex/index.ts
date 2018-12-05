import loadShaderProgram from "../../shaders/loadShaderProgram";
import GLInstance from "../../GLInstance";

import fragmentShaderGLSL from './fragment.glsl'
import vertextShaderGLSL from './vertex.glsl'
import RenderLoop from "../../RenderLoop";

export default class SimpleAnimatedVertex {

    gl:GLInstance
    renderLoop:RenderLoop

    vertCount =0

    pointSize = 0
    sizeStep = 3
    angle = 0
    angleStep = Math.PI / 180.0 * 90

    aPointSizeLocation: number
    uPointSizeLocation: WebGLUniformLocation
    uAngleLocation:WebGLUniformLocation

    constructor(gl:GLInstance) {
        this.gl = gl
        this.renderLoop = new RenderLoop(this.render)
    }

    init() {
        let gl = this.gl
        let glContext = gl.glContext

        let shaderProgram = loadShaderProgram(glContext,vertextShaderGLSL,fragmentShaderGLSL)
        glContext.useProgram(shaderProgram)

        let aPositionLocation = glContext.getAttribLocation(shaderProgram, "a_position")        
        this.uPointSizeLocation = glContext.getUniformLocation(shaderProgram, "uPointSize")
        this.uAngleLocation = glContext.getUniformLocation(shaderProgram, "uAngle")

        glContext.useProgram(null)

        var verts = new Float32Array([0,0,0])
        
        let vbo = gl.createArrayBuffer(verts)
        
        this.vertCount = verts.length / 3

        glContext.useProgram(shaderProgram)
        //glContext.uniform1f(uPointSizeLocation, 5.0)        

        glContext.bindBuffer(glContext.ARRAY_BUFFER, vbo)        
        glContext.enableVertexAttribArray(aPositionLocation)
        glContext.vertexAttribPointer(aPositionLocation,3,glContext.FLOAT,false,0,0)
        glContext.bindBuffer(glContext.ARRAY_BUFFER, null)

        glContext.drawArrays(glContext.POINTS, 0, this.vertCount)        
    }

    start() {
        this.renderLoop.start()
    }

    render = (dt:number) => {
        let gl = this.gl
        let glContext = this.gl.glContext

        this.pointSize += dt
        let size = Math.sin(this.pointSize) * 10.0 + 30.0

        glContext.uniform1f(this.uPointSizeLocation, size)

        this.angle += this.angleStep * dt

        glContext.uniform1f(this.uAngleLocation, this.angle)

        gl.clear()

        glContext.drawArrays(glContext.POINTS, 0, this.vertCount)
        
    }
}