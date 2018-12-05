import createShader from "./createShader";
import createProgram from "./createdProgram";

let loadShaderProgram = (glContext:WebGLRenderingContext, vertextShaderSrc:string, fragmentShaderSrc:string, validate:boolean = true) => {
    if(!vertextShaderSrc)	return null
    if(!fragmentShaderSrc)	return null
    
    let vertexShader = createShader(glContext,vertextShaderSrc,glContext.VERTEX_SHADER)
    if(!vertexShader)	return null

    var fragmentShader = createShader(glContext,fragmentShaderSrc,glContext.FRAGMENT_SHADER)	
    if(!fragmentShader)	return null
    
    return createProgram(glContext,vertexShader,fragmentShader,true);    
}

export default loadShaderProgram