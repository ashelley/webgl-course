import GLInstance from "../GLInstance";
import { VAO } from "../shaders/createMeshVAO";
import { createVertexArray, bindVertexArray } from "../shaders/vertexArray";
import { ATTR_POSITION_LOC } from "../shaders/standardAttributeLocations";

let createGrid = (gl:GLInstance, includeAxis?:boolean) => {
    let glContext = gl.glContext

    let verts = []
    let size = 2
    let div = 10.0
    let step = size / div
    let half = size / 2

    let p = 0
    for(let i = 0; i <= div; i++) {
        p = -half + (i * step)
        
        //vertical line
        // verts.push.apply(verts, [p, half, 0, 0]); // x1, y1, z1, c1
        // verts.push.apply(verts, [p, -half, 0, 1]); // x2, y2, z2, c2
        verts.push.apply(verts, [p, 0, half, 0]); // x2, y2, z2, c2
        verts.push.apply(verts, [p, 0, -half, 0]); // x2, y2, z2, c2

        p = half - (i * step)

        //horizontal line
        // verts.push.apply(verts, [-half, p, 0, 0]); // x1, y1, z1, c1
        // verts.push.apply(verts, [half, p, 0, 1]); // x2, y2, z2, c2
        verts.push.apply(verts, [-half, 0, p, 0]); // x1, y1, z1, c1
        verts.push.apply(verts, [half, 0, p, 0]); // x2, y2, z2, c2        
    }

    if(includeAxis) {
        verts.push(-1.1);	//x1
        verts.push(0);		//y1
        verts.push(0);		//z1
        verts.push(1);		//c2

        verts.push(1.1);	//x2
        verts.push(0);		//y2
        verts.push(0);		//z2
        verts.push(1);		//c2

        //y axis
        verts.push(0);//x1
        verts.push(-1.1);	//y1
        verts.push(0);		//z1
        verts.push(2);		//c2

        verts.push(0);		//x2
        verts.push(1.1);	//y2
        verts.push(0);		//z2
        verts.push(2);		//c2

        //z axis
        verts.push(0);		//x1
        verts.push(0);		//y1
        verts.push(-1.1);	//z1
        verts.push(3);		//c2

        verts.push(0);		//x2
        verts.push(0);		//y2
        verts.push(1.1);	//z2
        verts.push(3);		//c2
    }

    let attrColorLoc = 4

    let vao:Partial<VAO> = {}

    vao.drawMode = glContext.LINES
    vao.vao = createVertexArray(glContext)
    vao.vertexComponentLen = 4
    vao.vertexCount = verts.length / vao.vertexComponentLen

    let strideLen = Float32Array.BYTES_PER_ELEMENT * vao.vertexComponentLen

    vao.bufVerticies = glContext.createBuffer()

    bindVertexArray(glContext, vao.vao)

    glContext.bindBuffer(glContext.ARRAY_BUFFER, vao.bufVerticies)
    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(verts), glContext.STATIC_DRAW)
    glContext.enableVertexAttribArray(ATTR_POSITION_LOC)

    glContext.enableVertexAttribArray(attrColorLoc)
    glContext.vertexAttribPointer(ATTR_POSITION_LOC, 3, glContext.FLOAT, false, strideLen, 0)
    glContext.vertexAttribPointer(attrColorLoc, 1, glContext.FLOAT, false, strideLen, Float32Array.BYTES_PER_ELEMENT * 3)

    bindVertexArray(glContext, null)
    glContext.bindBuffer(glContext.ARRAY_BUFFER, null)

    return vao
}

export default createGrid