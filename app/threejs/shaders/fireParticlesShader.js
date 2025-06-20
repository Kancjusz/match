export const vertex = `

    varying vec4 projectedPos;
    varying float vRadius;
    varying float vCameraDist;
    varying float vPointOriginRatio;
    varying float midPointDistanceRatio;
    varying float vDisplacedFireSmokeRatio;

    uniform float uTime;
    uniform float uSize;
    uniform float uYLength;
    uniform float uFlameRise;
    uniform float uWidthRatio;
    uniform float uOnFireFactor;
    uniform float uYDisplacement;
    uniform float uOriginPeakDistance;
    uniform float uSideDistance;
    uniform vec2 uPeak2Normalized;
    uniform vec3 uOriginPos;
    uniform vec2 uPointer;

    #define MAX_POINTER_DIST 1.
    #define MAX_POINTER_DIST_TWO 5.
    #define MAX_POINTER_ORIGIN_DIST 0.3

    float ONE_OVER_LOG10 = 1. / log(10.);

    float log10(float x)
    {
        return log(x) * ONE_OVER_LOG10;
    }

    float fireFunction(float y,float length)
    {
        return sin(-3.*y/(length*0.5))*log10(y/(length*0.5))*uSize;
    }

    float putOutFireFunction(float y,float length)
    {
        return log(y+1.);
    }

    float putOutFireDisplacementFunction(float y,float length)
    {
        return log(y) * sin(y);
    }

    float putOutFireDisplacementOppositeFunction(float y,float length)
    {
        return log(y) * sin(-y);
    }

    vec4 pointerDisplacedPosition(vec3 finalPos, float PointPeakDistance)
    {
        vec4 newPosition = modelViewMatrix * vec4(finalPos, 1.0);

        vec4 projectedPointer = projectionMatrix * modelViewMatrix * vec4(uPointer,1.,1.) * uWidthRatio;
        projectedPos = projectionMatrix * newPosition * uWidthRatio;

        vec2 offsetVector2 = normalize(vec2(projectedPos.x - projectedPointer.x,0.));
        float pointerDisplacementFactor2 = smoothstep(0.,1.,sqrt(clamp(projectedPos.y/ uWidthRatio - projectedPointer.y/ uWidthRatio + uYDisplacement,0.,1.)));

        float inBounds = clamp(uPointer.y - uOriginPos.y,0.,1.);

        float heightRatio = (uOriginPeakDistance-PointPeakDistance)/(uOriginPeakDistance-uYDisplacement);
        heightRatio = clamp(smoothstep(0.,1.,heightRatio),0.,1.);
        float heightFactor = clamp(sqrt(log10((heightRatio+0.01)*100.))*0.5,0.,1.);

        float smth = smoothstep(1.,0.,abs(projectedPointer.x - projectedPos.x)*4.);
        float smth2 = smoothstep(0.,1.,abs(projectedPointer.x - projectedPos.x)*2.);

        float pointerDisplaceModifier = (smth * smth2 + 0.5 * smth * smth2 + 0.5 * (1.-smth2))/2.;
        pointerDisplaceModifier = smoothstep(0.,1.,pointerDisplaceModifier) * inBounds * pow(pointerDisplacementFactor2/uOriginPeakDistance,1./2.) * heightFactor * pow(heightRatio,3.);

        vec2 displaceDetachedDirection = -vec2(uPointer.x - uOriginPos.x,0.1) * 2.;
        vRadius = 0.; 
        if(uPointer.y < uOriginPos.y + uYDisplacement + MAX_POINTER_ORIGIN_DIST/2. 
        && distance(uPointer,uOriginPos.xy) > MAX_POINTER_ORIGIN_DIST
        && (uPointer.x - finalPos.x) * (uPointer.x - uOriginPos.x) < 0.)
        {
            vRadius = (2.-distance(finalPos.xy,uPointer))/3.;
            displaceDetachedDirection = mix(vec2(0,0),displaceDetachedDirection,vRadius);
        }
        
        vec2 finalOffset = offsetVector2 * heightFactor * pow(heightRatio,2.) * pow(pointerDisplacementFactor2/uOriginPeakDistance,1./2.) * inBounds;

        vec2 projectedPointerDisplacedPosition = projectedPos.xy + offsetVector2 * 4. * pointerDisplaceModifier + displaceDetachedDirection * 1. * vRadius * inBounds;

        return vec4(projectedPointerDisplacedPosition,projectedPos.zw);
    }

    void main() {
        //CALCULATING POSITION

        float yLength = uOriginPeakDistance;

        float y = position.y * uYLength + uFlameRise;
        if(y<0.) return;

        float bounds = fireFunction(y,yLength);
        float putOutBounds = putOutFireFunction(y,position.y * uYLength);

        vec2 xzVector = vec2(position.x,position.z);

        float displacementMultiplier = pow(y/yLength,2.);
        if(y > yLength*0.5)
            displacementMultiplier = pow(((y/yLength)-sqrt(y/yLength/2.)),log10(9.)) + y/yLength/2.;

        vec3 finalPos = vec3(0.);
        vec3 putOutPos = vec3(0.);

        //random dispacement
        float randX = sin(sin(uTime * 2.) * (y/yLength) * 5. * bounds * cos(bounds * 10.)) * 0.2 * (0.1/bounds);
        float randZ = sin(sin(uTime * 2.) * (y/yLength) * 5. * bounds * cos(bounds * 10.)) * 0.2 * (0.1/bounds);

        float randFunc = mix(0.,1.,(xzVector.x * xzVector.y) * sin(uTime));
        float putOutDisplacement = mix(
            putOutFireDisplacementFunction(y,position.y * uYLength),
            putOutFireDisplacementOppositeFunction(y,position.y * uYLength),
            randFunc
        );

        midPointDistanceRatio = distance(vec2(0.),xzVector);

        //SETTING FIRE WORLD POS
        finalPos.x = uOriginPos.x + xzVector.x * bounds + uPeak2Normalized.x * uSideDistance * displacementMultiplier + randX;
        finalPos.y = uOriginPos.y + y;
        finalPos.z = uOriginPos.z + xzVector.y * bounds + uPeak2Normalized.y * uSideDistance * displacementMultiplier + randZ;

        //SETTING PUT OUT FIRE WORLD POS
        putOutPos.x = uOriginPos.x + xzVector.x * putOutBounds + putOutDisplacement + randX;;
        putOutPos.y = uOriginPos.y + y;
        putOutPos.z = uOriginPos.z + xzVector.y * putOutBounds + putOutDisplacement + randZ;

        //SETTING THE POSITION

        vec3 firePos = mix(putOutPos,finalPos,uOnFireFactor);

        float cameraDist = distance(cameraPosition,(modelMatrix * vec4(firePos, 1.0)).xyz);

        cameraDist = clamp(cameraDist / (distance(cameraPosition,vec3(0.))),0.,1.);

        vDisplacedFireSmokeRatio = (0.5 * uOriginPeakDistance - uYDisplacement) / (uOriginPeakDistance - uYDisplacement);
        float PointPeakDistance = distance(firePos,uOriginPos + vec3(0.,uYDisplacement,0.));
        vPointOriginRatio = PointPeakDistance/(uOriginPeakDistance-uYDisplacement);

        gl_PointSize = 15. * (1.-cameraDist);

        vec4 finalProjectedPos = pointerDisplacedPosition(firePos,PointPeakDistance);
        
        //gl_Position = projectedPos;
        //gl_Position = projectionMatrix * modelViewMatrix * vec4(putOutPos,1.);
        gl_Position = finalProjectedPos;
    }
`

export const fragment = `

    varying vec4 projectedPos;
    varying float vRadius;
    varying float vCameraDist;
    varying float vPointOriginRatio;
    varying float midPointDistanceRatio;
    varying float vDisplacedFireSmokeRatio;

    uniform float uTime;
    uniform float uOnFireFactor;
    uniform float uMidColorStrength;
    uniform vec4 uColors[COLORS_AMOUNT];
    uniform vec4 uMidDistanceColors[MID_COLORS_AMOUNT];
    uniform vec4 uSmokeColor;
    uniform vec2 uPointer;

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

        float displacedFireSmokeRatio = mix(0.1,vDisplacedFireSmokeRatio,uOnFireFactor);

        float ratio = smoothstep(displacedFireSmokeRatio,displacedFireSmokeRatio-0.2,vPointOriginRatio);
        float ratio2 = smoothstep(displacedFireSmokeRatio,displacedFireSmokeRatio-0.01,vPointOriginRatio);
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

        col.rgb = mix(uSmokeColor.rgb,col.rgb,uOnFireFactor);

        float alphaOnFireFactor = mix(0.5,1.,uOnFireFactor);
        float alphaCombined = clamp(col.a * alpha * alpha2 * pow(1.-vPointOriginRatio,3.),0.,1.);

        gl_FragColor = vec4(col.rgb * (round(ratio2)+1.) * alphaOnFireFactor,alphaCombined);
        //gl_FragColor = vec4(vec3(clamp(vRadius,0.,1.)),1.);
    }
`