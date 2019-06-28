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
}

export let parseASCfile = (source:string, options:ASCObjectOptions = {}) => {
    let tokenStream = new ASCTokenStream();
    tokenStream.tokenize(source)

    let parser = new ASCParser(tokenStream.tokens)
    parser.options = options

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
    options:ASCObjectOptions
    name:string
    vertices:{x:number,y:number,z:number,w:number}[] = []

    averageRadius:number
    maxRadius:number

    applyVertexOptions(v:{x:number,y:number,z:number}) {
        let options = this.options
        
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
        this.applyVertexOptions(vertex)
        this.vertices.push(vertex)
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
            this.currentObject.options = {...this.options}
            this.parseObjectName()
        }
        else if(commandText == "Tri-mesh, Verticies") {
            //TODO:
            this.chompLine()
        }
        else if(commandText == "Vertex list") {
            this.chompLine()
        }
        else if(commandText.startsWith("Vertex")) {
            this.parsePoly()
        }
        else {
            this.chompLine()
        }
    }

    parsePoly() {
        let x = this.parseNamedFloat("X")
        let y = this.parseNamedFloat("Y")
        let z = this.parseNamedFloat("Z")

        this.currentObject.addVertex({x,y,z})
        this.chompLine()
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