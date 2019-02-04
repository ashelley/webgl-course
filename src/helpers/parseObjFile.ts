let parseObjFile = (source:string, options:{flipYUV?:boolean,disableParseNormals?:boolean,disableParseUvs?:boolean} = {}) => {
    let parser = new ObjParser(source)
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

enum ObjTokenType {
    EOL = "EOL",
    EOF = "EOF",
    NUMBER = "NUMBER",
    STRING = "STRING",
    PUNCTUATION = "PUNC",
}

interface ObjFileToken {
    value?:string
    tokenType: ObjTokenType
}

export class Obj {
    name:string
    
    verts: number[] = []
    normals: number[] = []
    uvs:number[] = []

    faces:ObjFace[] = []

    getVertex(vertIndex:number) {
        let xIndex = vertIndex * 3

        if(xIndex < 0 || xIndex + 2 >= this.verts.length) {
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

class ObjParser {
    index: number = -1
    tokens:ObjFileToken[]    
    objects:Obj[] = []
    currentObject:Obj
    flipYUV:boolean

    disableParseUv = false
    disableParseNormals = false

    constructor(source:string) {
        let tokenizer = new TokenStream()
        tokenizer.tokenize(source)
        this.tokens = tokenizer.tokens
    }

    peek() {
        if(this.index >= this.tokens.length) {
            return {tokenType: ObjTokenType.EOF}
        }
        else {
            return this.tokens[this.index+1]
        }
    }

    next() {        
        this.index++
        if(this.index < this.tokens.length) {
            return this.tokens[this.index]
        }
        else {
            return {tokenType: ObjTokenType.EOF}
        }
    }

    token() {
        return this.tokens[this.index]
    }

    parse() {
        let token = this.next()
        let i = 0
        while(true) {
            if(token.tokenType == ObjTokenType.EOF) {
                break;
            }
            else if(token.tokenType == ObjTokenType.STRING) {
                this.parseCommand()
            }
            else {
                this.unexpectedToken()
            }
            token = this.next()
            i++
        }    
    }

    unexpectedToken(reason?:string) {
        let token = this.token()
        let errMessage = "Unexpected Token: '" + token.value + "' Type: " + token.tokenType
        if(reason != null) {
            errMessage += " Reason: " + reason
        }
        throw new Error(errMessage)
    }

    parseCommand() {
        let token = this.token()
        if(token.tokenType !== ObjTokenType.STRING) {
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
        if(token.tokenType !== ObjTokenType.STRING) {
            this.unexpectedToken("Expected Command")
        }        
        if(token.value !== "o") {
            this.unexpectedToken("Expected Object")
        }
        token = this.next()
        if(token.tokenType != ObjTokenType.STRING) {
            this.unexpectedToken("Expected String")
        }
        this.currentObject = new Obj()
        this.currentObject.name = token.value
        this.objects.push(this.currentObject)
        this.chompLine()
    }

    parseVertex() {
        let token = this.token()
        if(token.tokenType !== ObjTokenType.STRING) {
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
            if(token.tokenType !== ObjTokenType.STRING) {
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
            if(token.tokenType !== ObjTokenType.STRING) {
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

    parseFace() {
        let token = this.token()
        if(token.tokenType !== ObjTokenType.STRING) {
            this.unexpectedToken("Expected Command")
        }        
        if(token.value !== "f") {
            this.unexpectedToken("Expected Face")
        }           

        //TODO: support quads
        for(let i = 0; i < 3; i++) {
            let vertexIndex = this.parseIndex()
            this.skipSlash()
            
            let uvIndex:number
            let next = this.peek()
            //NOTE: when we have no uv's defined in the obj file we end u with a face like f 1//1 (blank uv index)
            if(next.tokenType == ObjTokenType.PUNCTUATION && next.value == "/") {
                uvIndex -1
            } else {
                uvIndex = this.parseIndex()
            }
            this.skipSlash()
            
            let normalIndex = this.parseIndex()

            let vert = this.currentObject.getVertex(vertexIndex - 1)
            
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
            
            let face = new ObjFace()                    
            face.addVertex(vert.x, vert.y, vert.z)
            face.addUV(uv.u, uv.v)
            face.addNormal(normal.x, normal.y, normal.z)
            this.currentObject.faces.push(face)            
        }

        this.chompLine()
    }

    skipSlash() {
        let token = this.next()
        if(token.tokenType != ObjTokenType.PUNCTUATION || token.value != "/") {
            this.unexpectedToken("Expected /")
        }
    }

    parseReal() {
        let token = this.next()
        if(token.tokenType != ObjTokenType.NUMBER) {
            this.unexpectedToken("Expected Number");
        }
        let value = parseFloat(token.value)
        if(isNaN(value)) {
            this.unexpectedToken("Token Value NaN")
        }
        return value
    }

    parseIndex() {
        let token = this.next()
        if(token.tokenType != ObjTokenType.NUMBER) {
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

    chompLine() {
        for(;;) {
            let next = this.peek()
            if(next.tokenType == ObjTokenType.EOF) {
                break;
            }
            else if(next.tokenType == ObjTokenType.EOL) {
                next = this.next()
                if(this.peek().tokenType !== ObjTokenType.EOL) {
                    break;
                }
            }                
            this.next()
        }
    }
}

class TokenStream {
    tokens:ObjFileToken[]

    tokenize(source:string) {
        this.tokens = []
        let length = source.length
        for(let i = 0; i < length;) {
            let ch = source[i]
            if(ch == "\r") {
                if(i < length - 1) {
                    ch = source[++i]
                }
            }
            if(ch == "\n") {
                this.tokens.push({
                    tokenType: ObjTokenType.EOL
                })                
                i++
                continue;
            }
            let isNumber = false
            if(ch == "-") {
                if(i < length - 1) {
                    let next = source[i+1]
                    if(next >= "0" && next <= "9") {
                        isNumber = true
                    }
                }
            } else if(ch >= "0" && ch <= "9") {
                isNumber = true
            }
            if(isNumber) {
                let value = ""
                let hasDecimal = false
                do {                    
                    value += ch
                    if(ch == ".") {
                        hasDecimal = true
                    }                    
                    i++
                    if(i < length) {
                        ch = source[i]
                    }

                    if(ch == 'e') {
                        let next = source[i+1]
                        if(next == '-') {
                            let exp = source[i+2]
                            if(exp >= "0" && exp <= "9") {
                                value += ch + next
                                i+=2
                                ch = exp
                            }
                        }
                    }                    

                } while(
                       i < length
                    && 
                    (
                        (ch >= "0" && ch <= "9")
                        || (!hasDecimal && ch == ".")
                    )                                       
                )
                this.tokens.push({
                    tokenType: ObjTokenType.NUMBER,
                    value
                })                
            }            
            else if(ch == " " || ch == "\t") {
                i++
            }
            else if(ch == "/") {
                this.tokens.push({tokenType: ObjTokenType.PUNCTUATION, value: ch})
                i++
            }
            else {
                let value = ""
                while(i < length && ch != " " && ch != "\t" && ch != "\r" && ch != "\n") {
                    value += ch
                    i++
                    if(i < length) {
                        ch = source[i]
                    }                    
                }      
                this.tokens.push({
                    tokenType: ObjTokenType.STRING,
                    value
                })                           
            }
        }
        this.tokens.push({
            tokenType: ObjTokenType.EOF
        })
    }
}

export default parseObjFile