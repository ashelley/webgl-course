export enum TokenType {
    EOL = "EOL",
    EOF = "EOF",
    NUMBER = "NUMBER",
    STRING = "STRING",
    PUNCTUATION = "PUNC",
}

export interface Token {
    value?:string
    tokenType: TokenType
}

export abstract class TokenStream {
    tokens:Token[]

    i = 0
    length:number
    source:string


    abstract isPunctuation(ch:string);
    abstract isEndOfString(ch:string);

    isWhiteSpace(ch:string) {
        return ch == " " || ch == "\t" || ch == "\r" || ch == "\n"
    }

    chompString() {
        let value = ""
        let ch = this.source[this.i]
        while(this.i < this.length && !this.isEndOfString(ch)) {
            value += ch
            this.i++
            if(this.i < this.length) {
                ch = this.source[this.i]
            }                    
        }      
        return value
    }    

    tokenize(source:string) {
        this.tokens = []
        this.source = source
        let length = this.length = source.length
        this.i = 0
        for(; this.i < length;) {
            let ch = source[this.i]
            if(ch == "\r") {
                if(this.i < length - 1) {
                    ch = source[++this.i]
                }
            }
            if(ch == "\n") {
                this.tokens.push({
                    tokenType: TokenType.EOL
                })                
                this.i++
                continue;
            }
            let isNumber = false
            if(ch == "-") {
                if(this.i < length - 1) {
                    let next = source[this.i+1]
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
                    this.i++
                    if(this.i < length) {
                        ch = source[this.i]
                    }

                    if(ch == 'e') {
                        let next = source[this.i+1]
                        if(next == '-') {
                            let exp = source[this.i+2]
                            if(exp >= "0" && exp <= "9") {
                                value += ch + next
                                this.i+=2
                                ch = exp
                            }
                        }
                    }                    

                } while(
                       this.i < length
                    && 
                    (
                        (ch >= "0" && ch <= "9")
                        || (!hasDecimal && ch == ".")
                    )                                       
                )
                this.tokens.push({
                    tokenType: TokenType.NUMBER,
                    value
                })                
            }            
            else if(ch == " " || ch == "\t") {
                this.i++
            }
            else if(this.isPunctuation(ch)) {
                this.tokens.push({tokenType: TokenType.PUNCTUATION, value: ch})
                this.i++
            }
            else {
                let value = this.chompString()
                this.tokens.push({
                    tokenType: TokenType.STRING,
                    value
                })                           
            }
        }
        this.tokens.push({
            tokenType: TokenType.EOF
        })
    }
}