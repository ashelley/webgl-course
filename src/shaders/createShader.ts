import GLInstance from "../GLInstance";

export type ShaderType = number

let createShader = (glContext:WebGLRenderingContext, src:string, type:ShaderType) => {
    let shader = glContext.createShader(type)
    glContext.shaderSource(shader,src)
    glContext.compileShader(shader)

    if(!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        console.error("Error compiling shader: " + src, glContext.getShaderInfoLog(shader))
        glContext.deleteShader(shader)
        return null
    }

    return shader
}

export default createShader