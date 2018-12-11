import Shader from "../../shaders/Shader";

import fragmentShaderGLSL from './fragment.glsl'
import vertextShaderGLSL from './vertex.glsl'
import GLInstance from "../../GLInstance";

export default class extends Shader {

    uColor:WebGLUniformLocation

    constructor(gl:GLInstance, color:number[]) {
        super(gl, vertextShaderGLSL, fragmentShaderGLSL)

        let glContext = gl.glContext

        this.uColor	= glContext.getUniformLocation(this.program,"uColor")

        glContext.uniform3fv(this.uColor, color)
        
        glContext.useProgram(null)

    }
}