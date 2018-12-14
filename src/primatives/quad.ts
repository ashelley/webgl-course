import GLInstance from "../GLInstance";
import createMeshVAO from "../shaders/createMeshVAO";

let quad = (gl:GLInstance) => {
    let aVert = new Float32Array([ -0.5,0.5,0, -0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0 ])
    let aUV = new Float32Array([ 0,0, 0,1, 1,1, 1,0 ])
    let aIndex = new Uint16Array([ 0,1,2, 2,3,0 ])
    let mesh = createMeshVAO(gl.glContext,"Quad",aIndex,aVert,null,aUV);
    mesh.noCulling = true;
    mesh.doBlending = true;
    return mesh;
}

export default quad