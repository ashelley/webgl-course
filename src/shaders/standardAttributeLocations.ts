export const ATTR_POSITION_NAME	= "a_position";
export const ATTR_POSITION_LOC		= 0;
export const ATTR_NORMAL_NAME		= "a_norm";
export const ATTR_NORMAL_LOC		= 1;
export const ATTR_UV_NAME			= "a_uv";
export const ATTR_UV_LOC			= 2;
export interface StandardShaderAttributeLocations {
    position: number
    norm: number
    uv: number
}

let getStandardAttribLocations = (glContext:WebGLRenderingContext,program:WebGLProgram):StandardShaderAttributeLocations => {
    return {
        position:	glContext.getAttribLocation(program,ATTR_POSITION_NAME),
        norm:		glContext.getAttribLocation(program,ATTR_NORMAL_NAME),
        uv:			glContext.getAttribLocation(program,ATTR_UV_NAME)
    };
}

export default getStandardAttribLocations