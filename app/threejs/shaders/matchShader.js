export const vertexStick = `
    varying vec3 vWorldPos;

    uniform vec2 uBurnDirection;
    uniform float uBurnProgress;

    void main() {
        vWorldPos = (modelMatrix * vec4(csm_Position,1.)).xyz;

        vec3 worldPos = (vec4(csm_Position,1.)).xyz;
        float burnPosLerp = clamp(uBurnProgress - vWorldPos.y,0.,1.);

        float posSum = (worldPos.y) * 154253.1213345;
        float collapseRand = ((fract(sin(posSum)*1.0)+ 1.) * 0.5 * 0.9);
        vec2 collapsedPos = worldPos.xz * collapseRand;

        vec3 lerpedPos = mix(vec3(collapsedPos.x,worldPos.y,collapsedPos.y),worldPos, burnPosLerp);

        csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(lerpedPos,1.);
    }
`

export const fragmentStick = `

    varying vec3 vWorldPos;

    uniform vec2 uBurnDirection;
    uniform float uBurnProgress;

    void main() {
        float burnColorLerp = clamp(uBurnProgress - vWorldPos.y,0.,1.);

        csm_Roughness = (2.- burnColorLerp) * csm_Roughness;
        csm_DiffuseColor = mix(vec4(vec3(0.),1.),csm_DiffuseColor,burnColorLerp);
    }
`

export const vertexHead = `
    varying vec3 vWorldPos;

    uniform vec2 uBurnDirection;
    uniform float uBurnProgress;

    void main() {
        vWorldPos = (modelMatrix * vec4(csm_Position,1.)).xyz;

        vec3 worldPos = (vec4(csm_Position,1.)).xyz;
        float burnPosLerp = clamp(uBurnProgress - vWorldPos.y,0.,1.);

        float posSum = (worldPos.x + worldPos.y + worldPos.z) * 1253.1213;
        float collapseRand = ((fract(sin(posSum)*1.0)+ 1.) * 0.5 * 0.3) + 0.5;

        vec2 collapsedPos = worldPos.xz * collapseRand;

        vec3 lerpedPos = mix(vec3(collapsedPos.x,worldPos.y,collapsedPos.y),worldPos, burnPosLerp);

        csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(lerpedPos,1.);
    }
`

export const fragmentHead = `

    varying vec3 vWorldPos;

    uniform vec2 uBurnDirection;
    uniform float uBurnProgress;

    void main() {
        float burnColorLerp = clamp(uBurnProgress - vWorldPos.y,0.,1.);

        csm_Roughness = (2.- burnColorLerp) * csm_Roughness;
        csm_DiffuseColor = mix(vec4(vec3(0.),1.),csm_DiffuseColor,burnColorLerp);
    }
`