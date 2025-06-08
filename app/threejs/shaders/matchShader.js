export const vertexStick = `

    void main() {
        //gl_Position = projectionMatrix * newPosition;
    }
`

export const fragmentStick = `

    void main() {
        //csm_FragColor = diff;
    }
`

export const vertexHead = `

    uniform vec2 uBurnDirection;
    uniform float uBurnProgress;

    void main() {
        //gl_Position = projectionMatrix * newPosition; 
    }
`

export const fragmentHead = `

    uniform vec2 uBurnDirection;
    uniform float uBurnProgress;

    void main() {
        //csm_DiffuseColor = vec4(vec3(uBurnProgress),1.);
    }
`