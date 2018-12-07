import Vector3 from "../helpers/Vector3";
import Matrix4 from "../helpers/Matrix4";

export const deg2Rad = Math.PI/180;

type Matrix3Array = [number,number,number,number,number,number,number,number,number] | Float32Array
type Vector4Array = [number,number,number,number] | Float32Array

export default class Transform {

    position:Vector3
    scale:Vector3
    rotation:Vector3
    
    viewMatrix:Matrix4
    normalMatrix:Matrix3Array

    forward:Vector4Array
    up:Vector4Array
    right:Vector4Array

	constructor(){
		//transform vectors
		this.position	= new Vector3(0,0,0);	//Traditional X,Y,Z 3d position
		this.scale		= new Vector3(1,1,1);	//How much to scale a mesh. Having a 1 means no scaling is done.
		this.rotation	= new Vector3(0,0,0);	//Hold rotation values based on degrees, Object will translate it to radians
		this.viewMatrix 	= new Matrix4();		//Cache the results when calling updateMatrix
		this.normalMatrix	= new Float32Array(9);	//This is a Mat3, raw array to hold the values is enough for what its used for

		//Direction Vectors
		this.forward	= new Float32Array(4);	//When rotating, keep track of what the forward direction is
		this.up			= new Float32Array(4);	//what the up direction is, invert to get bottom
		this.right		= new Float32Array(4);	//what the right direction is, invert to get left
	}

	//--------------------------------------------------------------------------
	//Methods
	updateMatrix(){
		this.viewMatrix.reset() //Order is very important!!
			.vtranslate(this.position)
			.rotateX(this.rotation.x * deg2Rad)
			.rotateZ(this.rotation.z * deg2Rad)
			.rotateY(this.rotation.y * deg2Rad)
			.vscale(this.scale);

		//Calcuate the Normal Matrix which doesn't need translate, then transpose and inverses the mat4 to mat3
		Matrix4.normalMat3(this.normalMatrix,this.viewMatrix.raw);

		//Determine Direction after all the transformations.
		Matrix4.transformVec4(this.forward,	[0,0,1,0],this.viewMatrix.raw); //Z
		Matrix4.transformVec4(this.up,		[0,1,0,0],this.viewMatrix.raw); //Y
		Matrix4.transformVec4(this.right,	[1,0,0,0],this.viewMatrix.raw); //X

        return this.viewMatrix.raw;
	}

	updateDirection(){
		Matrix4.transformVec4(this.forward,	[0,0,1,0],this.viewMatrix.raw);
		Matrix4.transformVec4(this.up,		[0,1,0,0],this.viewMatrix.raw);
		Matrix4.transformVec4(this.right,	[1,0,0,0],this.viewMatrix.raw);
		return this;
	}

	getViewMatrix(){	return this.viewMatrix.raw; }
	getNormalMatrix(){	return this.viewMatrix; }

	reset(){
		this.position.set(0,0,0);
		this.scale.set(1,1,1);
		this.rotation.set(0,0,0);
	}
}
        
	