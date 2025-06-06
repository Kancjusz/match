export const vertex = `

    varying vec3 pos;
    varying float vCameraDist;
    varying float vPointOriginRatio;
    uniform float uTime;
    uniform vec3 uOriginPos;
    uniform float uOriginPeakDistance;

    void main() {

        vec4 newPosition = modelViewMatrix * vec4(position, 1.0);

        float cameraDist = distance(cameraPosition,newPosition.xyz);

        pos = (projectionMatrix * newPosition).xyz;
        cameraDist = clamp(cameraDist / (distance(cameraPosition,vec3(0.)) * 2.),0.,1.);

        float PointPeakDistance = distance(position,uOriginPos);
        vPointOriginRatio = PointPeakDistance/uOriginPeakDistance;

        gl_PointSize = 25. * (1.-cameraDist);

        gl_Position = projectionMatrix * newPosition;
    }
`

export const fragment = `

    varying vec3 pos;
    varying float vCameraDist;
    varying float vPointOriginRatio;

    uniform float uTime;
    uniform vec4 uColors[COLORS_AMOUNT];
    uniform vec4 uSmokeColor;

    float PI = 3.1415926535897932384626433832795;

    void main() {
        vec2 st = gl_PointCoord.xy;
        float mid = 0.5;

        float x = sin(st.x * PI) * sin(st.x * PI) * sin(st.x * PI) * sin(st.x * PI) * sin(st.x * PI);
        float y = sin(st.y * PI) * sin(st.y * PI) * sin(st.y * PI) * sin(st.y * PI) * sin(st.y * PI);

        float x1 = x*y;
        float alpha = x1;  

        float floatColorsAmount = float(COLORS_AMOUNT);

        float fireColorRatio = 2.*vPointOriginRatio - floor(2.*vPointOriginRatio);
        int colorIndex = int(floor(floatColorsAmount * fireColorRatio));
        float colorMixValue = fireColorRatio * floatColorsAmount - float(colorIndex);

        vec4 color1 = uColors[0];

        if(colorIndex >= COLORS_AMOUNT-1)
            color1 = uColors[colorIndex];
        else
            color1 = mix(uColors[colorIndex],uColors[colorIndex+1],colorMixValue);

        vec4 color2 = uSmokeColor;

        float ratio = smoothstep(0.5,0.4,vPointOriginRatio);
        float ratio2 = smoothstep(0.5,0.49,vPointOriginRatio);
        float alpha2 = mix(0.05,1.,ratio);

        vec4 col = mix(color2,color1,ratio2);

        gl_FragColor = vec4(col.rgb,col.a * alpha * alpha2 * (1.-vPointOriginRatio));
    }
`