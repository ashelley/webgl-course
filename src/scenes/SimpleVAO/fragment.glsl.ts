export default 
`#version 300 es
    precision mediump float;

    uniform float uPointSize;    

    out vec4 finalColor;

    void main(void) {
        float c = (40.0 - uPointSize) / 20.0;
        finalColor = vec4(c, c, c, 1.0);
    }

`