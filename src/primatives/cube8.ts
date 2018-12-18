import GLInstance from "../GLInstance";
import createMeshVAO from "../shaders/createMeshVAO";

let cube8 = (gl:GLInstance) => {

    /*

    0 (0,0)                     3 (1,0)
    x---------------------------x
    |                          /|
    |                      /    |
    |                   /       |
    |               /           |
    |           /               |
    |       /                   |
    |    /                      |
    |/                          |
    x---------------------------x    
    1 (0,1)                     2 (1,1)

    */

    let aVert = new Float32Array([ 
          //0             //1               //2              //3
         -0.5,0.5,0.5,0,   -0.5,-0.5,0.5,0,  0.5,-0.5,0.5,0,   0.5,0.5,0.5,0, //FRONT

         //4              //5               //6                //7
         0.5,0.5,-0.5,1,  0.5,-0.5,-0.5,1,  -0.5,-0.5,-0.5,1,   -0.5,0.5,-0.5,1 //BACK
    ])

    let aUV = new Float32Array([ 
        0,0, 0,1, 1,1, 1,0,
        0,0, 0,1, 1,1, 1,0,
    ])

    let aIndex = new Uint16Array([ 
        0,1,2, 2,3,0, //FRONT
        4,5,6, 6,7,4, //BACK
        3,2,5, 5,4,3, //RIGHT
        7,0,3, 3,4,7, //TOP
        7,6,1, 1,0,7, //LEFT
        1,2,6, 6,2,5  // BOTTOM
    ])

    let mesh = createMeshVAO(gl.glContext,"Cube8",aIndex,aVert,null,aUV,4);
    mesh.noCulling = true;
    mesh.doBlending = true;
    return mesh;
}

export default cube8