import GLInstance from "../GLInstance";
import createMeshVAO from "../shaders/createMeshVAO";

let cube = (gl:GLInstance, width:number = 1, height:number = 1,length:number = 1,x:number = 0,y:number = 0,z:number = 0) => {

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

    let w = width * 0.5
    let h = height * 0.5
    let l = length * 0.5 //depth

    let x0 = x - w
    let x1 = x + w
    let y0 = y - h
    let y1 = y + h
    let z0 = z - l
    let z1 = z + l


    let aVert = [ 
        //0              //1               //2              //3
         x0,y1,z1,0,      x0,y0,z1,0,      x1,y0,z1,0,      x1,y1,z1,0,  //FRONT

         //4              //5              //6              //7
         x1,y1,z0,1,      x1,y0,z0,1,      x0,y0,z0,1,      x0,y1,z0,1,  //BACK

         //7              //6              //1              //0
         x0,y1,z0,2,      x0,y0,z0,2,      x0,y0,z1,2,      x0,y1,z1,2,  //LEFT

         //1              //6              //5              //2
         x0,y0,z1,3,      x0,y0,z0,3,      x1,y0,z0,3,      x1,y0,z1,3,  //BOTTOM

         //3              //2              //5              //4
         x1,y1,z1,4,      x1,y0,z1,4,      x1,y0,z0,4,      x1,y1,z0,4,  //RIGHT         

         //7              //0              //3              //4
         x0,y1,z0,5,      x0,y1,z1,5,      x1,y1,z1,5,      x1,y1,z0,5   //TOP
    ]

    let aIndex:number[] = []

    //Build indicies [0,1,2  2,3,0] of each quad
    for(let i = 0; i < aVert.length / 4; i += 2) {
        aIndex.push(i, i + 1, (Math.floor(i / 4) * 4) + ((i + 2) % 4))
    }

    let aUV:number[] = []

    for(let i = 0; i < 6; i++) {
        aUV.push(0,0, 0,1, 1,1, 1,0)
    }

    let normals:number[] = [
        0, 0, 1,    0, 0, 1,    0, 0, 1,   0, 0, 1, //FRONT
        0, 0,-1,    0, 0,-1,    0, 0,-1,   0, 0,-1, //BACK
       -1, 0,-1,   -1, 0, 0,   -1, 0, 0,  -1, 0, 0, //LEFT
        0,-1, 0,    0,-1, 0,    0,-1, 0,   0,-1, 0, //BOTTOM
        1, 0, 0,    1, 0, 0,    1, 0, 0,   1, 0, 0, //RIGHT
        0, 1, 0,    0, 1, 0,    0, 1, 0,   0, 1, 0, //TOP
    ]

    let mesh = createMeshVAO(gl.glContext,"Cube",new Uint16Array(aIndex),new Float32Array(aVert),new Float32Array(normals),new Float32Array(aUV),4);
    mesh.noCulling = true;
    mesh.doBlending = true;
    return mesh;
}

export default cube