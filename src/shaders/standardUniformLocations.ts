export const ATTR_PERSPECTIVE	= "uPMatrix";
export const ATTR_MODEL_MATRIX		= "uMVMatrix";
export const ATTR_CAMERA_MATRIX			= "uCameraMatrix";
export const ATTR_MAIN_TEX = "uMainTex";

export interface StandardShaderUniformLocations {
    perspective: WebGLUniformLocation
    modalMatrix: WebGLUniformLocation
    cameraMatrix: WebGLUniformLocation
    mainTexture: WebGLUniformLocation
}

let getStandardUniformLocations = (glContext:WebGLRenderingContext,program:WebGLProgram):StandardShaderUniformLocations => {
    return {
        perspective:	glContext.getUniformLocation(program,ATTR_PERSPECTIVE),
        modalMatrix:	glContext.getUniformLocation(program,ATTR_MODEL_MATRIX),
        cameraMatrix:	glContext.getUniformLocation(program,ATTR_CAMERA_MATRIX),
        mainTexture:	glContext.getUniformLocation(program,ATTR_MAIN_TEX)
    };
}

export default getStandardUniformLocations