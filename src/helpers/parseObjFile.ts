import { TokenStream, TokenType } from "../parsers/TokenStream";
import { ParserBase } from "../parsers/ParserBase";


let parseObjFile = (source:string, options:{flipYUV?:boolean,disableParseNormals?:boolean,disableParseUvs?:boolean} = {}) => {
    let tokenStream = new ObjTokenStream();
    tokenStream.tokenize(source)
    let parser = new ObjParser(tokenStream.tokens)
    parser.flipYUV = !!options.flipYUV
    parser.disableParseUv = !!options.disableParseUvs
    parser.disableParseNormals = !!options.disableParseNormals
    parser.parse()

    let obj0 = parser.objects[0]
    if(obj0 == null) {
        throw new Error("Object not loaded")
    }

    return obj0
}

class ObjTokenStream extends TokenStream {    
    isEndOfString(ch: string) {
        return this.isWhiteSpace(ch)
    }
    isPunctuation(ch: string) {
        return ch == '/'
    }
}

export class Obj {
    name:string
    
    verts: number[] = []
    normals: number[] = []
    uvs:number[] = []

    faces:ObjFace[] = []

    getVertex(vertIndex:number) {
        let xIndex = vertIndex * 3

        if(xIndex < 0 || xIndex >= this.verts.length) {
            throw new Error("Invalid Vertex Index")
        }

        let yIndex = xIndex + 1
        let zIndex = xIndex + 2

        return {x: this.verts[xIndex], y: this.verts[yIndex], z: this.verts[zIndex]}
    }    

    getUV(uvIndex:number) {
        let uIndex = uvIndex * 2

        if(uIndex < 0 || uIndex + 1 >= this.uvs.length) {
            throw new Error("Invalid UV Index")
        }

        let vIndex = uIndex + 1

        return {u: this.uvs[uIndex], v: this.uvs[vIndex]}
    }

    getNormal(normalIndex:number) {
        let xIndex = normalIndex * 3

        if(xIndex < 0 || xIndex + 2 >= this.normals.length) {
            throw new Error("Invalid Vertex Index")
        }

        let yIndex = xIndex + 1
        let zIndex = xIndex + 2

        return {x: this.normals[xIndex], y: this.normals[yIndex], z: this.normals[zIndex]}
    }     

    addVertex(x:number, y:number, z:number) {
        this.verts.push(x,y,z)
    }

    addUV(u:number,v:number) {
        this.uvs.push(u,v)
    }

    addNormal(x:number, y:number, z:number) {
        this.normals.push(x,y,z)
    }    
}

class ObjFace {
    verts: number[] = []
    normals: number[] = []
    uvs:number[] = []

    addVertex(x:number, y:number, z:number) {
        this.verts.push(x,y,z)
    }

    addUV(u:number,v:number) {
        this.uvs.push(u,v)
    }

    addNormal(x:number, y:number, z:number) {
        this.normals.push(x,y,z)
    }       
}

class ObjParser extends ParserBase {
    objects:Obj[] = []
    currentObject:Obj
    flipYUV:boolean

    disableParseUv = false
    disableParseNormals = false

    parse() {
        let token = this.next()
        let i = 0
        while(true) {
            if(token.tokenType == TokenType.EOF) {
                break;
            }
            else if(token.tokenType == TokenType.STRING) {
                this.parseCommand()
            }
            else {
                this.unexpectedToken()
            }
            token = this.next()
            i++
        }    
    }

    parseCommand() {
        let token = this.token()
        if(token.tokenType !== TokenType.STRING) {
            throw new Error("Expected String Literal For Command Token: " + token.tokenType)
        }
        if(token.value == "o") {            
            this.parseObject()
        }
        else if(token.value == "v") {
            if(this.currentObject == null) {
                this.currentObject = new Obj()
                this.objects.push(this.currentObject)                
            }
            this.parseVertex()
        }
        else if(token.value == "vt") {
            this.parseUV()
        }        
        else if(token.value == "vn") {
            this.parseNormal()
        }
        else if(token.value == "f") {
            this.parseFace()
        }
        else {
            this.chompLine()
        }
    }

    parseObject() {
        let token = this.token()
        if(token.tokenType !== TokenType.STRING) {
            this.unexpectedToken("Expected Command")
        }        
        if(token.value !== "o") {
            this.unexpectedToken("Expected Object")
        }
        token = this.next()
        if(token.tokenType != TokenType.STRING) {
            this.unexpectedToken("Expected String")
        }
        this.currentObject = new Obj()
        this.currentObject.name = token.value
        this.objects.push(this.currentObject)
        this.chompLine()
    }

    parseVertex() {
        let token = this.token()
        if(token.tokenType !== TokenType.STRING) {
            this.unexpectedToken("Expected Command")
        }        
        if(token.value !== "v") {
            this.unexpectedToken("Expected Vertex")
        }        
        
        let x = this.parseReal()
        let y = this.parseReal()
        let z = this.parseReal()

        this.currentObject.addVertex(x, y, z)        

        this.chompLine()
    }

    parseUV() {
        if(!this.disableParseUv) {
            let token = this.token()
            if(token.tokenType !== TokenType.STRING) {
                this.unexpectedToken("Expected Command")
            }        
            if(token.value !== "vt") {
                this.unexpectedToken("Expected UV")
            }        
            
            let u = this.parseReal()
            let v = this.parseReal()
    
            if(this.flipYUV) {
                v = 1 - v
            }    
            this.currentObject.addUV(u,v)        
        }

        this.chompLine()
    }
    
    parseNormal() {
        if(!this.disableParseUv) {
            let token = this.token()
            if(token.tokenType !== TokenType.STRING) {
                this.unexpectedToken("Expected Command")
            }        
            if(token.value !== "vn") {
                this.unexpectedToken("Expected Normal")
            }        
            
            let x = this.parseReal()
            let y = this.parseReal()
            let z = this.parseReal()

            this.currentObject.addNormal(x, y, z)        
        }

        this.chompLine()
    }    

    faceCount = 0

    parseFace() {
        let token = this.token()
        if(token.tokenType !== TokenType.STRING) {
            this.unexpectedToken("Expected Command")
        }        
        if(token.value !== "f") {
            this.unexpectedToken("Expected Face")
        }        

        //TODO: support quads
        let face = new ObjFace()                       
        for(let i = 0; i < 3; i++) {     
            this.currentObject.faces.push(face)                        
            let vertexIndex = this.parseIndex()            
            let vert = this.currentObject.getVertex(vertexIndex - 1)            
            face.addVertex(vert.x, vert.y, vert.z)        

            let next = this.peek()

            if(next.tokenType != TokenType.PUNCTUATION || next.value != "/") continue

            let uvIndex:number    
            let normalIndex:number        

            this.skipSlash()        
            next = this.peek()            
            //NOTE: when we have no uv's defined in the obj file we end u with a face like f 1//1 (blank uv index)
            if(next.tokenType == TokenType.PUNCTUATION && next.value == "/") {
                uvIndex -1
            } else {
                uvIndex = this.parseIndex()
            }
            this.skipSlash()
            
            normalIndex = this.parseIndex()
            
            let uv:{u:number,v:number}
            if(!this.disableParseUv && uvIndex >= 0) {
                uv = this.currentObject.getUV(uvIndex - 1)
            } 
            else {
                uv = {u: 0, v: 0}
            }

            let normal:{x:number,y:number,z:number}
            if(!this.disableParseNormals && normalIndex >= 0) {
                normal = this.currentObject.getNormal(normalIndex - 1)
            } else {
                normal = {x: 0, y: 1, z: 0}
            }          

            face.addUV(uv.u, uv.v)
            face.addNormal(normal.x, normal.y, normal.z)
        }

        this.chompLine()
    }

    skipSlash() {
        let token = this.next()
        if(token.tokenType != TokenType.PUNCTUATION || token.value != "/") {
            this.unexpectedToken("Expected /")
        }
    }

    parseIndex() {
        let token = this.next()
        if(token.tokenType != TokenType.NUMBER) {
            this.unexpectedToken("Expected Number");
        }
        let value = parseFloat(token.value)
        if(isNaN(value)) {
            this.unexpectedToken("Token Value NaN")
        }
        if(value != Math.floor(value) || value < 0) {
            this.unexpectedToken("Token Not A Valid Index")
        }
        return Math.floor(value)
    }    
}

export default parseObjFile