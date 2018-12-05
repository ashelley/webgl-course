import Shader from "../../shaders/Shader";

import fragmentShaderGLSL from './fragment.glsl'
import vertextShaderGLSL from './vertex.glsl'
import GLInstance from "../../GLInstance";

export default class extends Shader {

    uPointSize:WebGLUniformLocation
    uAngle:WebGLUniformLocation

    constructor(gl:GLInstance) {
        super(gl, vertextShaderGLSL, fragmentShaderGLSL)

        let glContext = gl.glContext

        this.uPointSize	= glContext.getUniformLocation(this.program,"uPointSize")
        this.uAngle		= glContext.getUniformLocation(this.program,"uAngle")
        
        glContext.useProgram(null)

    }

    set(size:number,angle:number) {
        let glContext = this.gl.glContext

        glContext.uniform1f(this.uPointSize,size)
        glContext.uniform1f(this.uAngle,angle)

        return this;        
    }
}