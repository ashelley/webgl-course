import { Token, TokenType } from "./TokenStream";

export abstract class ParserBase {

    index: number = -1
    tokens:Token[]        

    constructor(tokens:Token[]) {
        this.tokens = tokens
    }

    peek() {
        if(this.index >= this.tokens.length) {
            return {tokenType: TokenType.EOF}
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
            return {tokenType: TokenType.EOF}
        }
    }

    token() {
        return this.tokens[this.index]
    } 

    parseReal() {
        let token = this.next()
        if(token.tokenType != TokenType.NUMBER) {
            this.unexpectedToken("Expected Number");
        }
        let value = parseFloat(token.value)
        if(isNaN(value)) {
            this.unexpectedToken("Token Value NaN")
        }
        return value
    }  

    eol() {
        let token = this.token()
        return token.tokenType == TokenType.EOL || token.tokenType == TokenType.EOF
    }
    
    chompLine() {
        let endFound = false
        for(;;) {
            let next = this.peek()
            if(next.tokenType == TokenType.EOF) {
                return                
            }
            else if(next.tokenType == TokenType.EOL) {
                endFound = true
                this.next()
            }                
            else if(endFound) {
                return
            }
            else {
                this.next()
            }
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
}