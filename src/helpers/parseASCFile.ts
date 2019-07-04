import { TokenStream, TokenType } from "../parsers/TokenStream";
import { ParserBase } from "../parsers/ParserBase";

interface ASCObjectOptions {
    invertX?:boolean,
    invertY?:boolean,
    invertZ?:boolean
    swapYZ?:boolean
    swapXZ?:boolean
    swapXY?:boolean
    scaleVerts?:{x:number,y:number,z:number}
    invertWindingOrder?:boolean
}

export let parseASCfile = (source:string) => {
    let tokenStream = new ASCTokenStream();
    tokenStream.tokenize(source)

    let parser = new ASCParser(tokenStream.tokens)

    parser.parse()

    let ascFile = new ASCFile()
    ascFile.objects = parser.objects

    return ascFile
}

export class ASCFile {
    objects:ASCObject[]
}

export class ASCTokenStream extends TokenStream {
    isPunctuation(ch: string) {
        return ch == ':'
    }

    isEndOfString(ch:string) {
        return ch == ':' || this.isWhiteSpace(ch)
    }
}

export class ASCObject {
    name:string
    vertices:{x:number,y:number,z:number, w:number}[] = []
    srcVertices:{x:number,y:number,z:number}[] = []
    srcVerticesByFaceIndex:{x:number,y:number,z:number}[] = []

    averageRadius:number
    maxRadius:number

    compileVertices(options:ASCObjectOptions) {
        for(let i = 0; i < this.srcVerticesByFaceIndex.length; i+=3) {
            let s0 = this.srcVerticesByFaceIndex[i]
            let s1 = this.srcVerticesByFaceIndex[i+1]
            let s2 = this.srcVerticesByFaceIndex[i+2]
            
            let v0 = {x: s0.x, y: s0.y, z: s0.z, w:1}
            let v1 = {x: s1.x, y: s1.y, z: s1.z, w:1}
            let v2 = {x: s2.x, y: s2.y, z: s2.z, w:1}            

            this.applyVertexOptions(v0, options)
            this.applyVertexOptions(v1, options)
            this.applyVertexOptions(v2, options)

            if(options.invertWindingOrder) {
                let tmp0 = v0
                let tmp2 = v2

                v0 = tmp2
                v2 = tmp0
            }

            this.vertices.push(v0,v1,v2)
        }
    }

    applyVertexOptions(v:{x:number,y:number,z:number}, options:ASCObjectOptions) {
        
        if(options.invertX) this.invert('x', v)
        if(options.invertY) this.invert('y', v)
        if(options.invertZ) this.invert('z', v)
        
        if(options.swapYZ) this.swap('y','z',v)
        if(options.swapXZ) this.swap('x','z',v)
        if(options.swapXY) this.swap('x','y',v)

        if(options.scaleVerts) {
            v.x *= options.scaleVerts.x
            v.y *= options.scaleVerts.y
            v.z *= options.scaleVerts.z
        }

    }

    invert(p:keyof{x:number,y:number,z:number}, v:{x:number,y:number,z:number})  {
        v[p] = -v[p]
    }

    swap(p0:keyof{x:number,y:number,z:number},p1:keyof{x:number,y:number,z:number}, v:{x:number,y:number,z:number}) {
        let tmp = v[p0]
        v[p0] = v[p1]
        v[p1] = tmp
    }

    addVertex(v:{x:number,y:number,z:number}) {    
        let vertex = {...v,w:1}
        this.srcVertices.push(vertex)
    }

    computeRadius() {
        //TODO
    }
}

export class ASCParser extends ParserBase {    
    options:ASCObjectOptions

    currentObject:ASCObject    

    objects:ASCObject[] = []

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
            else if(this.eol()) {
                
            }
            else {
                this.unexpectedToken()
            }
            token = this.next()
            i++
        }    
    }    

    parseCommand() {
        let commandText = ""
        while(!this.eol()) {
            let token = this.token()        
            if(token.tokenType == TokenType.PUNCTUATION && token.value == ":") {
                this.next()
                break;
            }
            else {
                if(commandText != "") commandText += " "
                commandText += token.value
            }
            this.next()
        }

        if(commandText == "Named object") {
            this.currentObject = new ASCObject()
            this.objects.push(this.currentObject)
            this.parseObjectName()
        }
        else if(commandText == "Tri-mesh, Verticies") {
            //TODO:
            if(!this.eol()) {
                this.chompLine()
            }

        }
        else if(commandText == "Vertex list") {
            if(!this.eol()) {            
                this.chompLine()
            }
        }
        else if(commandText.startsWith("Vertex")) {
            this.parseVertex()
        }        
        else if(commandText == "Face list") {
            if(!this.eol()) {            
                this.chompLine()
            }            
        }    
        else if(commandText.startsWith("Face")) {
            this.parseFace()
        }                
        else {
            this.chompLine()
        }
    }

    parseFace() {
        let a = this.parseNamedInt("A")
        let b = this.parseNamedInt("B")
        let c = this.parseNamedInt("C")

        let o = this.currentObject

        let vert0 = o.srcVertices[a]
        let vert1 = o.srcVertices[b]
        let vert2 = o.srcVertices[c]

        o.srcVerticesByFaceIndex.push(vert0,vert1,vert2)

        if(!this.eol()) {
            this.chompLine()
        }        
    }

    parseVertex() {
        let x = this.parseNamedFloat("X")
        let y = this.parseNamedFloat("Y")
        let z = this.parseNamedFloat("Z")

        this.currentObject.addVertex({x,y,z})
        if(!this.eol()) {
            this.chompLine()
        }
    }

    parseNamedFloat(name:string) {
        let token = this.token()
        if(token.tokenType != TokenType.STRING || token.value != name) {
            this.unexpectedToken("Expected " + name + " value");
            return
        }
        token = this.next()        
        if(token.tokenType != TokenType.PUNCTUATION || token.value != ":") {        
            this.unexpectedToken("Expected : for " + name);
            return            
        }
        let value = this.parseReal()
        this.next()
        return value        
    }

    parseNamedInt(name:string) {
        let token = this.token()
        if(token.tokenType != TokenType.STRING || token.value != name) {
            this.unexpectedToken("Expected " + name + " value");
            return
        }
        token = this.next()        
        if(token.tokenType != TokenType.PUNCTUATION || token.value != ":") {        
            this.unexpectedToken("Expected : for " + name);
            return            
        }
        let value = this.parseInt()
        this.next()
        return value        
    }    

    parseObjectName() {
        let token = this.token()
        if(token.tokenType != TokenType.STRING) {
            this.unexpectedToken("Expected string for object name.")
            return
        }
        let name = token.value
        if(name.startsWith('"')) {
            name = name.substr(1)
        }
        if(name.endsWith('"')) {
            name = name.substr(0,name.length-1)
        }
        this.currentObject.name = name
        this.chompLine()
    }    
}