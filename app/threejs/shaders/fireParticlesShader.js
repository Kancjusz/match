export const vertex = `

    varying float vRadius;
    varying float vCameraDist;
    varying float vPointOriginRatio;
    varying float midPointDistanceRatio;
    varying float vDisplacedFireSmokeRatio;

    uniform float uTime;
    uniform float uSize;
    uniform float uFlameRise;
    uniform float uYDisplacement;
    uniform float uOriginPeakDistance;
    uniform float uSideDistance;
    uniform vec2 uPeak2Normalized;
    uniform vec3 uOriginPos;

    float ONE_OVER_LOG10 = 1. / log(10.);

    float log10(float x)
    {
        return log(x) * ONE_OVER_LOG10;
    }

    float fireFunction(float y,float length)
    {
        return sin(-3.*y/(length*0.5))*log10(y/(length*0.5))*uSize;
    }

    void main() {
        //CALCULATING POSITION

        float yLength = uOriginPeakDistance;

        float y = position.y * yLength + uFlameRise;
        if(y<0.) return;

        float bounds = fireFunction(y,yLength);
        vRadius = bounds;

        vec2 xzVector = vec2(position.x,position.z);

        float displacementMultiplier = pow(y/yLength,2.);
        if(y > yLength*0.5)
            displacementMultiplier = pow(((y/yLength)-sqrt(y/yLength/2.)),log10(9.)) + y/yLength/2.;

        vec3 finalPos = vec3(0.);

        //random dispacement
        float randX = sin(sin(uTime * 2.) * (y/yLength) * 5. * bounds * cos(bounds * 10.)) * 0.2 * (0.1/bounds);
        float randZ = sin(sin(uTime * 2.) * (y/yLength) * 5. * bounds * cos(bounds * 10.)) * 0.2 * (0.1/bounds);

        midPointDistanceRatio = distance(vec2(0.),xzVector);

        finalPos.x = uOriginPos.x + xzVector.x * bounds + uPeak2Normalized.x * uSideDistance * displacementMultiplier + randX;
        finalPos.y = uOriginPos.y + y;
        finalPos.z = uOriginPos.z + xzVector.y * bounds + uPeak2Normalized.y * uSideDistance * displacementMultiplier + randZ;

        //SETTING THE POSITION
        vec4 newPosition = modelViewMatrix * vec4(finalPos, 1.0);

        float cameraDist = distance(cameraPosition,newPosition.xyz);

        cameraDist = clamp(cameraDist / (distance(cameraPosition,vec3(0.)) * 2.),0.,1.);

        vDisplacedFireSmokeRatio = (0.5 * uOriginPeakDistance - uYDisplacement) / (uOriginPeakDistance - uYDisplacement);
        float PointPeakDistance = distance(finalPos,uOriginPos + vec3(0.,uYDisplacement,0.));
        vPointOriginRatio = PointPeakDistance/(uOriginPeakDistance-uYDisplacement);

        gl_PointSize = 25. * (1.-cameraDist);

        gl_Position = projectionMatrix * newPosition;
    }
`

export const fragment = `

    varying vec3 pos;
    varying float vRadius;
    varying float vCameraDist;
    varying float vPointOriginRatio;
    varying float midPointDistanceRatio;
    varying float vDisplacedFireSmokeRatio;

    uniform float uTime;
    uniform float uMidColorStrength;
    uniform vec4 uColors[COLORS_AMOUNT];
    uniform vec4 uMidDistanceColors[MID_COLORS_AMOUNT];
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

        float ratio = smoothstep(vDisplacedFireSmokeRatio,vDisplacedFireSmokeRatio-0.2,vPointOriginRatio);
        float ratio2 = smoothstep(vDisplacedFireSmokeRatio,vDisplacedFireSmokeRatio-0.01,vPointOriginRatio);
        float alpha2 = mix(0.05,1.,ratio);

        float midColorsRatio = max(0.,(midPointDistanceRatio-(1.-uMidColorStrength))*(1./(uMidColorStrength)));
        int midColorsIndex = int(floor(midColorsRatio * float(MID_COLORS_AMOUNT)));
        float midColorMixValue = midColorsRatio * float(MID_COLORS_AMOUNT) * vPointOriginRatio - float(midColorsIndex);
        vec4 midColors = uMidDistanceColors[0];
        if(midColorsIndex >= MID_COLORS_AMOUNT-1)
            midColors = uMidDistanceColors[midColorsIndex];
        else
            midColors = mix(uMidDistanceColors[midColorsIndex],uMidDistanceColors[midColorsIndex+1],midColorMixValue);

        vec4 colWithMid = mix(color1,midColors, midColorsRatio);
        vec4 col = mix(color2,colWithMid,ratio2);


        gl_FragColor = vec4(col.rgb,col.a * alpha * alpha2 * (1.-vPointOriginRatio));
    }
`