export default class Vector2 {
    x:number
    y:number

    constructor(x:number, y: number) {
        this.x = x
        this.y = y
    }

    swap() {
        let x = this.x
        this.x = this.y
        this.y = x        
    }
}