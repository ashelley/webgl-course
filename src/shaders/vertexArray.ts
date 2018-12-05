export interface VertexArray {

}


interface WebGLRenderingContextExt {
    createVertexArray: () => VertexArray
    bindVertexArray: (arg:VertexArray|null) => void
}

export const bindVertexArray = (glContext:WebGLRenderingContext,vertexArray:VertexArray|null) => {
    return (glContext as unknown as WebGLRenderingContextExt).bindVertexArray(vertexArray)    
}

export const createVertexArray = (glContext:WebGLRenderingContext):VertexArray => {
    return (glContext as unknown as WebGLRenderingContextExt).createVertexArray()        
}