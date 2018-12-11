export default 
`#version 300 es
    in vec3 a_position;
    layout(location=4) in float a_color;

    uniform mat4 uMVMatrix; 

    uniform vec3 uColor[4];

    out lowp vec4 color;

    void main(void) {
        color = vec4(uColor[int(a_color)], 1.0);
        gl_Position = uMVMatrix * vec4(a_position, 1.0);
    }
` 