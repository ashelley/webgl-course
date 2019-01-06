import Shader from "../../shaders/Shader";
import GLInstance from "../../GLInstance";
import Transform from "../../primatives/Transform";
import Model from "../../primatives/Model";

export class LitModelShader extends Shader {

    mainTexture: WebGLTexture = -1
    lightPositionLoc: WebGLUniformLocation
    cameraPositionLoc: WebGLUniformLocation
    normalMatrixLoc: WebGLUniformLocation

	constructor(gl:GLInstance,pMatrix:Float32Array){
        super(gl,vertexShaderGLSL, fragmentShaderGLSL)
        
        let glContext = gl.glContext

        this.lightPositionLoc = glContext.getUniformLocation(this.program, "uLightPos")
        this.cameraPositionLoc = glContext.getUniformLocation(this.program, "uCamPos")
        this.normalMatrixLoc = glContext.getUniformLocation(this.program, "uNormMatrix")

		this.setPerspective(pMatrix)
		glContext.useProgram(null)
    }
    
    setTexture(texture:WebGLTexture) {
        this.mainTexture = texture
        return this
    }

    setLightPos(transform:Transform) {
        let glContext = this.gl.glContext
        glContext.uniform3fv(this.lightPositionLoc, transform.position.asFloatArray32())
        return this
    }

    setCameraPosition(transform:Transform) {
        let glContext = this.gl.glContext
        glContext.uniform3fv(this.cameraPositionLoc, transform.position.asFloatArray32())        
        return this
    }

    preRender() {
        let glContext = this.gl.glContext

        glContext.activeTexture(glContext.TEXTURE0)
        glContext.bindTexture(glContext.TEXTURE_2D,this.mainTexture)
        glContext.uniform1i(this.uniformLoc.mainTexture, 0)

        return this
    }

    renderModel(model:Model) {
        this.gl.glContext.uniformMatrix3fv(this.normalMatrixLoc, false, model.transform.getNormalMatrix())
        super.renderModel(model)
        return this
    }
}

let vertexShaderGLSL = `#version 300 es
    
    in vec4 a_position;	//Standard position data.
    in vec3 a_norm;
    in vec2 a_uv;
    
    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;
    uniform mat3 uNormMatrix;
    uniform vec3 uCamPos;

    out vec3 vPos;
    out vec3 vNorm;
    out vec3 vCamPos;
    out highp vec2 vUV;

    void main(void) {
        vec4 pos = uMVMatrix * vec4(a_position.xyz, 1.0); // position in world space
        vPos = pos.xyz;
        vNorm = uNormMatrix * a_norm;
        vUV = a_uv;
        
        gl_Position = uPMatrix * uCameraMatrix * pos;
    }
`

let fragmentShaderGLSL = `#version 300 es
    
    precision mediump float;
    
    uniform sampler2D uMainTex;
    uniform vec3 uLightPos;

    in vec3 vPos;
    in vec3 vNorm;
    in highp vec2 vUV;
    in vec3 vCamPos;
    
    out vec4 finalColor;
    
    void main(void) {

        vec4 baseColor = texture(uMainTex, vUV);
        vec3 lightColor = vec3(1.0,1.0,1.0);
        vec3 ambientLight = lightColor * 0.15;

        //Distance between Pixel and Light Source, Normalize to make it a direction vector
        vec3 lightDirection = normalize(uLightPos - vPos);  

        //Dot Product of two directions gives an angle of sort, 
        //It basicly a mapping between 0 to 90 degrees and a scale of 0 to 1
        //So the closer to 90 degrees the closer to 1 we get. 
        //In relation, the closer to 180 degrees the closer the value will be -1.
        //But we dont need the negative when dealing with light, 
        //so we cap the lowest possible value to 0 by using MAX.
        //Note, both values used in dot product needs to be normalized 
        //to get a proper range between 0 to 1.
        float diffAngle = max(dot(vNorm,lightDirection),0.0);        

        //So if the light source is 90 degrees above the pixel, 
        //then use the max light color or use a faction of the light;
        //The idea is to use the angle to determine how strong the light color should be. 
        //90 degrees is max, 0 uses no light leaving the pixel dark.
        float diffuseStrength = 0.3;
        vec3 diffuseColor = diffAngle * lightColor * diffuseStrength;	        

        //NOTE : Might be easier to switch vertexPos, light and camera to local space. 
        // Can remove inverse of camera matrix in the process. 
        // For prototyping keeping things in WorldSpace.
        
        float specularStrength = 0.2f;	//0.15
        float specularShininess = 1.0f; //256.0

        //Get the camera direction from the fragment position.
        vec3 camDirection = normalize(vCamPos - vPos);	

        //Using the normal as the 45 degree type of pivot, 
        //get the reflective direction from the light direction
        vec3 reflectDirection = reflect(-lightDirection,vNorm);	

        //Now determine the angle of the reflective dir and camera, 
        //If seeing spot on (90d) then full light.
        float specularPower = pow( max(dot(reflectDirection,camDirection),0.0) ,specularShininess);	
        vec3 specularLight = specularStrength * specularPower * lightColor;        

        //finalColor = texture(uMainTex,vec2(texCoord.s, texCoord.t));
        vec3 calculatedColor = (diffuseColor + ambientLight + specularLight) * baseColor.rgb;
        finalColor = vec4(calculatedColor, 1.0);
    }
`