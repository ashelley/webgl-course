import { ATTR_POSITION_LOC, ATTR_NORMAL_LOC, ATTR_UV_LOC } from "./standardAttributeLocations";
import { createVertexArray, bindVertexArray, WebGLVertexArrayObject } from "./vertexArray";

export interface VAO {
    drawMode:number
    vao:WebGLVertexArrayObject

    bufVerticies: WebGLBuffer
    vertexComponentLen: number
    vertexCount: number

    bufNormals: WebGLBuffer
    bufUV: WebGLBuffer

    bufIndex: WebGLBuffer
    indexCount: number

    noCulling:boolean
    doBlending:boolean
}

//let cache:{[name:string]:VAO} = {}

let createMeshVAO = (glContext:WebGLRenderingContext, name:string, indicies:Uint16Array, 
                        vertices:Float32Array, normals:Float32Array = null, uvs:Float32Array = null):VAO => {

    let result:Partial<VAO> = {
        drawMode: glContext.TRIANGLES
    }

    result.vao = createVertexArray(glContext)

    if(vertices != null) {
        result.bufVerticies = glContext.createBuffer()
        result.vertexComponentLen = 3
        result.vertexCount = vertices.length / result.vertexComponentLen

        glContext.bindBuffer(glContext.ARRAY_BUFFER, result.bufVerticies)
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW)

        glContext.enableVertexAttribArray(ATTR_POSITION_LOC)
        glContext.vertexAttribPointer(ATTR_POSITION_LOC,3,glContext.FLOAT,false,0,0);

    }

    if(normals != null) {
        result.bufNormals = glContext.createBuffer()

        glContext.bindBuffer(glContext.ARRAY_BUFFER, result.bufNormals)
        glContext.bufferData(glContext.ARRAY_BUFFER, normals, glContext.STATIC_DRAW)

        glContext.enableVertexAttribArray(ATTR_NORMAL_LOC)
        glContext.vertexAttribPointer(ATTR_NORMAL_LOC,3,glContext.FLOAT,false,0,0)
    }      

    if(uvs != null) {
        result.bufUV = glContext.createBuffer()

        glContext.bindBuffer(glContext.ARRAY_BUFFER, result.bufUV)
        glContext.bufferData(glContext.ARRAY_BUFFER, uvs, glContext.STATIC_DRAW)

        glContext.enableVertexAttribArray(ATTR_UV_LOC)
        glContext.vertexAttribPointer(ATTR_UV_LOC,2,glContext.FLOAT,false,0,0)
    }    

    if(indicies != null) {
        result.bufIndex = glContext.createBuffer()
        result.indexCount = indicies.length

        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, result.bufIndex)
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, indicies, glContext.STATIC_DRAW)

    }

    bindVertexArray(glContext, null)

    glContext.bindBuffer(glContext.ARRAY_BUFFER, null)

    if(indicies != null)  {
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER,null)
    }

    let vao = result as VAO //TODO: can we check this with typing

    //cache[name] = vao

    return vao
}

export default createMeshVAO