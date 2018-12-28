
type CubeMapImages = [
    HTMLImageElement,
    HTMLImageElement,
    HTMLImageElement,
    HTMLImageElement,
    HTMLImageElement,
    HTMLImageElement
]

enum CubeMapPosition {
    RIGHT = 0,
    LEFT = 1,
    TOP = 2,
    BOTTOM = 3,
    BACK = 4,
    FRONT = 5
}


let loadCubeMap = (glContext:WebGLRenderingContext, imageId:string, images:CubeMapImages) => {
    let texture = glContext.createTexture()
    glContext.bindTexture(glContext.TEXTURE_CUBE_MAP,texture)

    //NOTE this could be done in a loop ie: but we did it explicitly below to understand the required ordering
    // for(var i=0; i < 6; i++){
    //     glContext.texImage2D(glContext.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, images[i]);
    // }    

    glContext.texImage2D(glContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, 
                            images[CubeMapPosition.RIGHT])

    glContext.texImage2D(glContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, 
                            images[CubeMapPosition.LEFT])                                

    glContext.texImage2D(glContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, 
                            images[CubeMapPosition.TOP])                                        

    glContext.texImage2D(glContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, 
                            images[CubeMapPosition.BOTTOM])                                                                   

    glContext.texImage2D(glContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, 
                            images[CubeMapPosition.BACK])                                                                                                

    glContext.texImage2D(glContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, 
                            images[CubeMapPosition.FRONT])          
                            
    //TEXTURE_WRAP_R: number;  // 0x8072 from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/webgl2/index.d.ts   
    let extGLContext:WebGLRenderingContext & { TEXTURE_WRAP_R: GLenum} = glContext as any //TODO: fix ts typing from lib.dom.ts

    glContext.texParameteri(glContext.TEXTURE_CUBE_MAP, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR);	    //Setup up scaling
    glContext.texParameteri(glContext.TEXTURE_CUBE_MAP, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);	    //Setup down scaling
    glContext.texParameteri(glContext.TEXTURE_CUBE_MAP, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);	    //Stretch image to X position
    glContext.texParameteri(glContext.TEXTURE_CUBE_MAP, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);	    //Stretch image to Y position
    glContext.texParameteri(glContext.TEXTURE_CUBE_MAP, extGLContext.TEXTURE_WRAP_R, glContext.CLAMP_TO_EDGE);	//Stretch image to Z position        

    glContext.bindTexture(glContext.TEXTURE_CUBE_MAP, null)

    return texture

}

export default loadCubeMap