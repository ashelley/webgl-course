import GLInstance from "../GLInstance";
import createProgram from "./createdProgram";
import getStandardAttribLocations, { StandardShaderAttributeLocations } from "./standardAttributeLocations";
import { VAO } from "./createMeshVAO";
import { bindVertexArray } from "./vertexArray";
import loadShaderProgram from "./loadShaderProgram";

export default class Shader {

    gl:GLInstance
    program:WebGLProgram

    attribLoc:StandardShaderAttributeLocations

	constructor(gl:GLInstance,vertShaderSrc:string,fragShaderSrc:string){
        this.gl = gl
        let glContext = gl.glContext        

        this.program = loadShaderProgram(glContext,vertShaderSrc,fragShaderSrc,true);

		if(this.program != null){
			glContext.useProgram(this.program);
			this.attribLoc = getStandardAttribLocations(glContext,this.program);
			//this.uniformLoc = {};	//TODO: Replace in later lessons with get standardUniformLocations.
		}

		//NOTE: Extended shaders should deactivate shader when done calling super and setting up custom parts in the constructor.
	}

	activate() { 
        let glContext = this.gl.glContext
        glContext.useProgram(this.program)
        return this
    }
	deactivate() { 
        let glContext = this.gl.glContext
        glContext.useProgram(null)
        return this
    }

	dispose(){
        let glContext = this.gl.glContext
		if(glContext.getParameter(glContext.CURRENT_PROGRAM) === this.program) { 
            glContext.useProgram(null)
        }
		glContext.deleteProgram(this.program);
	}

	preRender() {

    } 

	render(vao:VAO) {
        let glContext = this.gl.glContext
		bindVertexArray(glContext, vao.vao)
		
		if(vao.indexCount) {
            glContext.drawElements(vao.drawMode, vao.indexCount, glContext.UNSIGNED_SHORT, 0)
        }
		else {
            glContext.drawArrays(vao.drawMode, 0, vao.vertexCount)
        }

		bindVertexArray(glContext, null)

		return this
	}
}