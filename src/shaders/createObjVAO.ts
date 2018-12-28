import createMeshVAO from "./createMeshVAO";
import { Obj } from "../helpers/parseObjFile";

let createObjVAO = (glContext:WebGLRenderingContext, name:string, obj:Obj) => {
    let faces = obj.faces    
    let numFaces = faces.length
    let indices = new Uint16Array(numFaces)
    let vertices = new Float32Array(numFaces * 3)
    let uvs = new Float32Array(numFaces * 2)
    let normals = new Float32Array(numFaces * 3)

    for(let i = 0; i < numFaces; i++) {
        indices[i] = i

        let vertStartIndex = i * 3
        let uvStartIndex = i * 2
        let normalStartIndex = vertStartIndex

        let face = faces[i]

        vertices[vertStartIndex + 0] = face.verts[0]
        vertices[vertStartIndex + 1] = face.verts[1]
        vertices[vertStartIndex + 2] = face.verts[2]

        uvs[uvStartIndex + 0] = face.uvs[0]
        uvs[uvStartIndex + 1] = face.uvs[1]

        normals[normalStartIndex + 0] = face.normals[0]
        normals[normalStartIndex + 1] = face.normals[1]
        normals[normalStartIndex + 2] = face.normals[2]        
    }

    return createMeshVAO(glContext, name, indices, vertices, normals, uvs)
}

export default createObjVAO