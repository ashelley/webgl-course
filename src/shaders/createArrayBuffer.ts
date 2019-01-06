let createArrayBuffer = (glContext:WebGLRenderingContext, floatAry:Float32Array, isStatic:boolean = true) => {

    let buf = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER,buf);
    glContext.bufferData(glContext.ARRAY_BUFFER, floatAry, (isStatic)? glContext.STATIC_DRAW : glContext.DYNAMIC_DRAW );
    glContext.bindBuffer(glContext.ARRAY_BUFFER,null);
    return buf;
}

export default createArrayBuffer