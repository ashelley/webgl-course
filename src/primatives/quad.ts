import GLInstance from "../GLInstance";
import createMeshVAO from "../shaders/createMeshVAO";

let quad = (gl:GLInstance) => {
    var aVert = new Float32Array([ -0.5,0.5,0, -0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0 ]),
    aUV = new Float32Array([ 0,0, 0,1, 1,1, 1,0 ]),
    aIndex = new Uint16Array([ 0,1,2, 2,3,0 ]);
    var mesh = createMeshVAO(gl.glContext,"Quad",aIndex,aVert,null,aUV);
    mesh.noCulling = true;
    mesh.doBlending = true;
    return mesh;
}

export default quad