export const vertex = `

    varying vec3 pos;
    varying vec3 ogPos;
    varying float vCameraDist;
    varying float vPointPeakRatio;
    uniform float uTime;
    uniform vec3 uOriginPos;
    uniform float uOriginPeakDistance;

    void main() {

        vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
        vec4 newOriginPos = modelViewMatrix * vec4(uOriginPos, 1.0);
        ogPos = position;

        float cameraDist = distance(cameraPosition,newPosition.xyz);

        pos = (projectionMatrix * newPosition).xyz;
        cameraDist = clamp(cameraDist / (distance(cameraPosition,vec3(0.)) * 2.),0.,1.);

        float PointPeakDistance = distance(position,uOriginPos);
        vPointPeakRatio = PointPeakDistance/uOriginPeakDistance;

        gl_PointSize = 25. * (1.-cameraDist);

        gl_Position = projectionMatrix * newPosition;
    }
`

export const fragment = `

    varying vec3 pos;
    varying vec3 ogPos;
    varying float vCameraDist;
    varying float vPointPeakRatio;
    uniform float uTime;

    float PI = 3.1415926535897932384626433832795;

    void main() {
        vec2 st = gl_PointCoord.xy;
        float mid = 0.5;

        float x = sin(st.x * PI) * sin(st.x * PI) * sin(st.x * PI) * sin(st.x * PI) * sin(st.x * PI);
        float y = sin(st.y * PI) * sin(st.y * PI) * sin(st.y * PI) * sin(st.y * PI) * sin(st.y * PI);

        float x1 = x*y;
        float alpha = x1;  

        vec3 color1 = vec3(1.,1.,0.);
        vec3 color2 = vec3(0.5,0.5,0.5);

        float ratio = smoothstep(0.5,0.4,vPointPeakRatio);
        float ratio2 = smoothstep(0.5,0.49,vPointPeakRatio);
        float alpha2 = mix(0.05,1.,ratio);

        vec3 col = mix(color2,color1,ratio2);

        gl_FragColor = vec4(col,alpha * alpha2 * (1.-vPointPeakRatio));
    }
`