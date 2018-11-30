import GLInstance from "../GLInstance";

let createProgram = (glContext:WebGLRenderingContext, vertexShader:WebGLShader, fragmentShader:WebGLShader, validate:boolean) => {
    let program = glContext.createProgram()
    glContext.attachShader(program, vertexShader)
    glContext.attachShader(program, fragmentShader)
    glContext.linkProgram(program)

    if(!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
        console.error("Error creating shader program", glContext.getProgramInfoLog(program))
        glContext.deleteProgram(program)
        return null
    }

    if(validate) {
        glContext.validateProgram(program)
        if(!glContext.getProgramParameter(program, glContext.VALIDATE_STATUS)) {
            console.error("Error validating program", glContext.getProgramInfoLog(program))
            glContext.deleteProgram(program)
            return null
        }        
    }

    glContext.detachShader(program, vertexShader)
    glContext.detachShader(program, fragmentShader)

    glContext.deleteShader(vertexShader)    
    glContext.deleteShader(fragmentShader)

    return program
}

export default createProgram