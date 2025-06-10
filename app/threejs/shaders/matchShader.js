export const vertexStick = `
    varying vec3 vWorldPos;

    uniform vec2 uBurnDirection;
    uniform float uBurnProgress;
    uniform float uMaxHeight;

    void main() {
        vWorldPos = (modelMatrix * vec4(csm_Position,1.)).xyz;

        vec3 worldPos = (vec4(csm_Position,1.)).xyz;
        float burnPosLerp = clamp(uBurnProgress - vWorldPos.y,0.,1.);

        float posSum = (worldPos.y + uBurnDirection.x + uBurnDirection.y) * 154253.1213345;
        float collapseRand = ((fract(sin(posSum)*1.0)+ 1.) * 0.5 * 0.9);
        vec2 collapsedPos = worldPos.xz * collapseRand;

        vec3 lerpedPos = mix(vec3(collapsedPos.x,worldPos.y,collapsedPos.y),worldPos, burnPosLerp);

        float heightMultiplier = (clamp(vWorldPos.y / uMaxHeight,-1.,1.)+1.)*0.5;
        float burnProgressMult = clamp(uBurnProgress/uMaxHeight,0.,1.);

        vec2 bendPositionXZ = mix(lerpedPos.xz, lerpedPos.xz+uBurnDirection * sqrt(heightMultiplier), (1.-burnProgressMult) * (1.-burnPosLerp));
        vec3 bendPosition = vec3(bendPositionXZ.x,lerpedPos.y,bendPositionXZ.y);
        vec3 lerpedBendPos = mix(bendPosition,lerpedPos,burnPosLerp);

        csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(lerpedBendPos,1.);
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
    uniform float uMaxHeight;

    void main() {
        vWorldPos = (modelMatrix * vec4(csm_Position,1.)).xyz;

        vec3 worldPos = (vec4(csm_Position,1.)).xyz;
        float burnPosLerp = clamp(uBurnProgress - vWorldPos.y,0.,1.);

        float posSum = (worldPos.x + worldPos.y + worldPos.z + uBurnDirection.x + uBurnDirection.y) * 1253.1213;
        float collapseRand = ((fract(sin(posSum)*1.0)+ 1.) * 0.5 * 0.3) + 0.5;

        vec2 collapsedPos = worldPos.xz * collapseRand;

        vec3 lerpedPos = mix(vec3(collapsedPos.x,worldPos.y,collapsedPos.y),worldPos, burnPosLerp);

        float heightMultiplier = (clamp(vWorldPos.y / uMaxHeight,-1.,1.)+1.)*0.5;
        float burnProgressMult = clamp(uBurnProgress/uMaxHeight,0.,1.);

        vec2 bendPositionXZ = mix(lerpedPos.xz, lerpedPos.xz+uBurnDirection * sqrt(heightMultiplier),(1.-burnProgressMult) * (1.-burnPosLerp));
        vec3 bendPosition = vec3(bendPositionXZ.x,lerpedPos.y,bendPositionXZ.y);
        vec3 lerpedBendPos = mix(bendPosition,lerpedPos,burnPosLerp);

        csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(bendPosition,1.);
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