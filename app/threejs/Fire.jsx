import { Points } from "@react-three/drei";
import { useRef } from "react";
import { Vector2, Vector3, Vector4 } from "three";
import {vertex, fragment} from "./shaders/fireParticlesShader";
import { useFrame } from "@react-three/fiber";

export default function Fire({
        count = 10000, origin = [0,0,0], peakPoint = [0,2,0], yDisplacement = 0.5, midColorStrength = 0.5, 
        fireColors = [[1,1,0,1]], midDistanceColors=[[1,0,0,0.1]], smokeColor = [0.5,0.5,0.5,0.5], size = 1, change=0, peakPointCallback=null
    })
{
    const originVector = new Vector3(origin[0],origin[1],origin[2]);
    const peakVector = new Vector3(peakPoint[0],peakPoint[1],peakPoint[2]);
    const heightVector = new Vector3(origin[0],peakPoint[1],origin[2]);

    const yLength = originVector.distanceTo(peakVector);

    const sideDistance = heightVector.distanceTo(peakVector);
    const peak2Normalized = (new Vector2(peakVector.x - originVector.x,peakVector.z - originVector.z)).normalize();

    const smokeColorV4 = new Vector4(smokeColor[0],smokeColor[1],smokeColor[2],smokeColor[3]);

    const originPos = useRef(origin);
    const peakPos = useRef(peakPoint);
    const pointerFlameShiftVector = useRef(new Vector2(0,0));
    const intensityMultiplier = useRef(1);

    const prevPeak = useRef(peakVector);
    const prevPointerPos = useRef(new Vector2(0,0));
    const prevTime = useRef(0);

    const pointsUniforms = useRef({
        uTime: {value:0},
        uSize: {value: size},
        uYLength:{value: yLength},
        uFlameRise: {value: 0},
        uYDisplacement: {value: yDisplacement},
        uOriginPeakDistance: {value: yLength},
        uMidColorStrength: {value: midColorStrength},
        uOriginPos: {value: new Vector3(origin[0],origin[1],origin[2])},
        uSideDistance: {value: sideDistance},
        uPeak2Normalized: {value: peak2Normalized},
        uColors: {value: fireColors.map((e)=>{return new Vector4(e[0],e[1],e[2],e[3])})},
        uMidDistanceColors: {value: midDistanceColors.map((e)=>{return new Vector4(e[0],e[1],e[2],e[3])})},
        uSmokeColor: {value: smokeColorV4},
        uPointer: {value: new Vector2(0,0)},
    });

    const pointsDefines = useRef({
        COLORS_AMOUNT: fireColors.length,
        MID_COLORS_AMOUNT: midDistanceColors.length
    });

    let basePositions = new Float32Array(3 * count);

    for(let i = 0; i < count/2; i+=3)
    {
        let xzVector = new Vector2(Math.random()*2-1,Math.random()*2-1);
        const xzVectorLength = xzVector.length();
        xzVector = xzVector.normalize().multiplyScalar(xzVectorLength>1 ? 1/xzVectorLength : xzVectorLength);

        const y = Math.random();

        basePositions[i] = xzVector.x;
        basePositions[i+1] = y;
        basePositions[i+2] = xzVector.y;
        
        basePositions[i + count/2] = xzVector.x; 
        basePositions[i + count/2 + 1] = y-1;
        basePositions[i + count/2 + 2] = xzVector.y;
    }

    useFrame(({clock,pointer,camera})=>{
        //pointsUniforms.current.uOriginPos.value = new Vector3(origin[0],origin[1] - change.current,origin[2]);

        const time = clock.getElapsedTime(); 

        //POINTER TO WORLD POSITION
        let depth = originVector.z;
        const cameraOffset = camera.position.z;
        if ( depth < cameraOffset ) depth -= cameraOffset;
        else depth += cameraOffset;

        let fov = camera.fov * Math.PI / 180; 
        fov = 2 * Math.tan( fov / 2 ) * Math.abs(depth);

        const fovXy = new Vector2(fov,fov/camera.aspect);
        const pointerToWorldFov = new Vector2(
            pointer.x * fovXy.x, 
            pointer.y * fovXy.y + change.current - 0.5
        );

        //SET POINTER TO UNIFORMS
        pointsUniforms.current.uPointer.value = pointerToWorldFov;

        //FLAME SHIFT BASED ON POINTER MOVEMENT
        if(Math.abs(pointerToWorldFov.x - prevPointerPos.current.x) >= 1) prevPointerPos.current.lerp(pointerToWorldFov,0.5);

        const v2Origin = new Vector2(originVector.x,originVector.y);
        const flameShiftData = getFlameShiftVectorAndTime(pointerToWorldFov,prevPointerPos.current,v2Origin,time,prevTime.current,0.1);
        prevPointerPos.current = pointerToWorldFov;
        prevTime.current = time;

        setTimeout(()=>{
            pointerFlameShiftVector.current = pointerFlameShiftVector.current.lerp(flameShiftData.flameShiftVector,0.5);
        },flameShiftData.pointerToOriginTime*1000);

        //FLAME SHIFT BASED ON MATCH MOVEMENT
        const peakTab = peakPointCallback();
        let newPeakVector = new Vector3(peakTab[0],peakTab[1],peakTab[2]);

        newPeakVector.x += pointerFlameShiftVector.current.x;
        newPeakVector.y += pointerFlameShiftVector.current.y;

        newPeakVector = prevPeak.current.lerp(newPeakVector,0.1);
        prevPeak.current = newPeakVector;        

        const dynamicYLength = originVector.distanceTo(newPeakVector);
        const dynamicYLength2 = originVector.distanceTo(new Vector3(peakTab[0],peakTab[1],peakTab[2]));

        const newPeak2Normalized = (new Vector2(newPeakVector.x - originVector.x,newPeakVector.z - originVector.z)).normalize();
        pointsUniforms.current.uPeak2Normalized.value = newPeak2Normalized;

        const newHeightVector = new Vector3(originVector.x,newPeakVector.y,originVector.z)
        const newSideDistance = newHeightVector.distanceTo(newPeakVector);
        pointsUniforms.current.uSideDistance.value = newSideDistance;

        //RANDOM FLAME MOVEMENT
        const randPeakDistanceChange = (Math.sin(time) + 1) * 0.75 - 1;
        pointsUniforms.current.uOriginPeakDistance.value = dynamicYLength + change.current/2 + randPeakDistanceChange;
        peakPos.current = [peakPos[0],pointsUniforms.current.uOriginPeakDistance.value/2,peakPos[2]];

        intensityMultiplier.current = (randPeakDistanceChange*2 + dynamicYLength + 1.5)*0.5/dynamicYLength;

        pointsUniforms.current.uTime.value = time; 

        if(pointsUniforms.current.uFlameRise.value >= dynamicYLength2)
            pointsUniforms.current.uFlameRise.value = 0;
        pointsUniforms.current.uFlameRise.value += 0.01;
    });

    return(
        <group position={[0,0,0]}>
            <Points positions={basePositions}>
                <shaderMaterial
                    needsUpdate={true}
                    vertexShader={vertex}
                    fragmentShader={fragment}
                    alphaTest={true}
                    depthTest={true}
                    depthWrite={false}
                    transparent={true}
                    uniforms={pointsUniforms.current}
                    defines={pointsDefines.current}
                    toneMapped={false}
                />
            </Points>
            <FirePointLight positionRef={originPos} offset={[0,0.5,0.5]} intensityMultiplierRef={intensityMultiplier}/>
            <FirePointLight positionRef={originPos} offset={[0,0.5,-0.5]} intensityMultiplierRef={intensityMultiplier}/>
            <FirePointLight positionRef={originPos} offset={[0.5,0.5,0]} intensityMultiplierRef={intensityMultiplier}/>
            <FirePointLight positionRef={originPos} offset={[-0.5,0.5,0]} intensityMultiplierRef={intensityMultiplier}/>
            <FirePointLight positionRef={originPos} offset={[0,1,0.5]} intensityMultiplierRef={intensityMultiplier}/>
            <FirePointLight positionRef={originPos} offset={[0,1,-0.5]} intensityMultiplierRef={intensityMultiplier}/>
            <FirePointLight positionRef={originPos} offset={[0.5,1,0]} intensityMultiplierRef={intensityMultiplier}/>
            <FirePointLight positionRef={originPos} offset={[-0.5,1,0]} intensityMultiplierRef={intensityMultiplier}/>

            <FirePointLight positionRef={peakPos} offset={[0,0,0]} intensityMultiplierRef={intensityMultiplier}/>
        </group>
    );
}

function FirePointLight({position, positionRef, offset, intensityMultiplierRef = null})
{
    const ligthRef = useRef();
    const pos = (position == undefined) ? positionRef : {current:position};

    useFrame(()=>{
        ligthRef.current.position.set(pos.current[0] + offset[0],pos.current[1]+ offset[1],pos.current[2]+ offset[2]);
        ligthRef.current.intensity = intensityMultiplierRef != null ? intensityMultiplierRef.current * 2 : 2;
    });

    return(
        <pointLight ref={ligthRef} position={[0,0,0]} color={"#ff9955"} intensity={2} decay={2}/>
    );
}

function getFlameShiftVectorAndTime(pointerWorldPos, prevPointerPos, originPos, time, prevTime, shiftMultiplier)
{
    if(pointerWorldPos.x == prevPointerPos.x)
    {
        return {
            flameShiftVector: new Vector2(0,0),
            pointerToOriginTime: 0
        }
    }
    const dPosVec = new Vector2(0,0);
    dPosVec.subVectors(pointerWorldPos,prevPointerPos);
    const dt = time - prevTime;

    const velocity = dPosVec.divideScalar(dt);

    const pointerOriginVector = new Vector2(0,0);
    pointerOriginVector.subVectors(prevPointerPos,originPos);

    let angle = Math.atan2(velocity.y,velocity.x) - Math.atan2(pointerOriginVector.y,pointerOriginVector.x);
    if (angle > Math.PI)         
        angle -= 2 * Math.PI; 
    else if (angle <= -Math.PI)  
        angle += 2 * Math.PI; 

    let flameShiftVector = velocity.rotateAround(new Vector2(0,0),angle);

    flameShiftVector = flameShiftVector.multiplyScalar(shiftMultiplier);

    const pointerOriginDistance = originPos.distanceTo(prevPointerPos);
    const pointerToOriginTime = pointerOriginDistance/velocity.length();

    return {
        flameShiftVector: flameShiftVector,
        pointerToOriginTime: pointerToOriginTime
    }
}