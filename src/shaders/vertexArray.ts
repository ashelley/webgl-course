export interface WebGLVertexArrayObject {

}


interface WebGL2RenderingContext {
    createVertexArray: () => WebGLVertexArrayObject
    bindVertexArray: (arg:WebGLVertexArrayObject|null) => void
}

export const bindVertexArray = (glContext:WebGLRenderingContext,vertexArray:WebGLVertexArrayObject|null) => {
    return (glContext as unknown as WebGL2RenderingContext).bindVertexArray(vertexArray)    
}

export const createVertexArray = (glContext:WebGLRenderingContext):WebGLVertexArrayObject => {
    return (glContext as unknown as WebGL2RenderingContext).createVertexArray()        
}