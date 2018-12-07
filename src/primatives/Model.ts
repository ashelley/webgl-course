import Transform from "./Transform";
import { VAO } from "../shaders/createMeshVAO";

export default class Model {
    
    transform: Transform
    vao: Partial<VAO>

    constructor(vao?: Partial<VAO>) {
        this.vao = vao
        this.transform = new Transform();
    }

    setScale(x:number, y:number, z:number) { 
        this.transform.scale.set(x, y, z); 
        return this; 
    }

    setPosition(x:number, y:number, z:number) { 
        this.transform.position.set(x, y, z); 
        return this; 
    }
    setRotation(x:number, y:number, z:number) { 
        this.transform.rotation.set(x, y, z); 
        return this; 
    }

    addScale(x:number, y:number, z:number) { 
        this.transform.scale.x += x; 
        this.transform.scale.y += y; 
        this.transform.scale.y += y; 
        return this; 
    }

    addPosition(x:number, y:number, z:number) { 
        this.transform.position.x += x; 
        this.transform.position.y += y; 
        this.transform.position.z += z; 
        return this; 
    }

    addRotation(x:number, y:number, z:number) { 
        this.transform.rotation.x += x; 
        this.transform.rotation.y += y; 
        this.transform.rotation.z += z; 
        return this; 
    }

    preRender() {
        this.transform.updateMatrix(); 
        return this;
    }
}