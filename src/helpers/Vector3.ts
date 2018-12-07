export default class Vector3 {

    x:number
    y:number
    z:number    

	constructor(x:number, y:number, z:number){	
        this.x = x || 0.0;	
        this.y = y || 0.0;	
        this.z = z || 0.0; 
    }

	magnitude(v?:Vector3){
		if(v == null) {
            return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z)
        }

		//Get magnitude based on another vector
		var x = v.x - this.x,
			y = v.y - this.y,
			z = v.y - this.z;

		return Math.sqrt( x*x + y*y + z*z );
	}

	normalize() { 
        var mag = this.magnitude(); 
        this.x /= mag; 
        this.y /= mag; 
        this.z /= mag; 
        return this;
    }

	set(x,y,z) { 
        this.x = x; 
        this.y = y; 
        this.z = z;	
        return this; 
    }

	multiplyScalar (scalar:number){ 
        this.x *= scalar; 
        this.y *= scalar; 
        this.z *= scalar; 
        return this; 
    }

	asArray (){ 
        return [this.x,this.y,this.z]; 
    }

	asFloatArray32(){ 
        return new Float32Array([this.x,this.y,this.z]);
    }
	clone(){
        return new Vector3(this.x,this.y,this.z); 
    }
}