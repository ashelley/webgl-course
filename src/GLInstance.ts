import createShader from "./shaders/createShader";

export default class GLInstance {

    canvas:HTMLCanvasElement
    glContext:WebGLRenderingContext
    
    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas
        this.glContext = canvas.getContext("webgl2") as WebGLRenderingContext

        this.initialize()
    }

    initialize() {
        let gl = this.glContext

        gl.cullFace(gl.BACK);								//Back is also default
        gl.frontFace(gl.CCW);								//Dont really need to set it, its ccw by default.
        gl.enable(gl.DEPTH_TEST);							//Shouldn't use this, use something else to add depth detection
        gl.enable(gl.CULL_FACE);							//Cull back face, so only show triangles that are created clockwise
        gl.depthFunc(gl.LEQUAL);							//Near things obscure far things
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	//Setup default alpha blending        

        gl.clearColor(1.0,1.0,1.0,1.0)
    }

    clear() {
        let gl = this.glContext
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        return this
    }

    createArrayBuffer(array:Float32Array, isStatic:boolean = true) {
        let glContext = this.glContext

        let buffer = glContext.createBuffer()

        glContext.bindBuffer(glContext.ARRAY_BUFFER, buffer)
        glContext.bufferData(glContext.ARRAY_BUFFER, array, isStatic ? glContext.STATIC_DRAW : glContext.DYNAMIC_DRAW)
        glContext.bindBuffer(glContext.ARRAY_BUFFER, null)

        return buffer
    }

    setSize(width:number,height:number) {
        let canvas = this.canvas
        let glContext = this.glContext
        
        canvas.style.width = width + "px"
        canvas.style.height = height + "px"

        canvas.width = width
        canvas.height = height

        glContext.viewport(0,0,width,height)

        return this
    }

    fitScreen(widthPercentage:number = 1, heightPercentage:number = 1) {
        this.setSize(window.innerWidth * (widthPercentage || 1), window.innerHeight * (heightPercentage || 1))
        return this
    }
}