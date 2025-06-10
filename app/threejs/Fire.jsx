import { Points } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { BufferAttribute, Vector2, Vector3, Vector4 } from "three";
import {vertex, fragment} from "./shaders/fireParticlesShader";
import { useFrame } from "@react-three/fiber";

export default function Fire({
        count = 10000, origin = [0,0,0], peakPoint = [0,2,0], yDisplacement = 0.5, midColorStrength = 0.5, 
        fireColors = [[1,1,0,1]], midDistanceColors=[[1,0,0,0.1]], smokeColor = [0.5,0.5,0.5,0.5], size = 1, change=0
    })
{
    const originVector = new Vector3(origin[0],origin[1],origin[2]);
    const peakVector = new Vector3(peakPoint[0],peakPoint[1],peakPoint[2]);
    const heightVector = new Vector3(origin[0],peakPoint[1],origin[2]);

    const yLength = originVector.distanceTo(peakVector);

    const sideDistance = heightVector.distanceTo(peakVector);
    const peak2Normalized = (new Vector2(peakVector.x - originVector.x,peakVector.z - originVector.z)).normalize();

    const smokeColorV4 = new Vector4(smokeColor[0],smokeColor[1],smokeColor[2],smokeColor[3]);

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
        uSmokeColor: {value: smokeColorV4}
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

        basePositions[i] = xzVector.x 
        basePositions[i+1] = y;
        basePositions[i+2] = xzVector.y;

        
        basePositions[i + count/2] = xzVector.x 
        basePositions[i + count/2 + 1] = y-1
        basePositions[i + count/2 + 2] = xzVector.y;
    }

    useFrame(({clock})=>{
        pointsUniforms.current.uOriginPos.value = new Vector3(origin[0],origin[1] - change.current,origin[2]);

        const randPeakDistanceChange = Math.sin(clock.getElapsedTime()) * 0.5;
        //pointsUniforms.current.uYLength.value = yLength;
        pointsUniforms.current.uOriginPeakDistance.value = yLength + change.current /2 + randPeakDistanceChange;

        pointsUniforms.current.uTime.value = clock.getElapsedTime(); 

        if(pointsUniforms.current.uFlameRise.value >= yLength)
            pointsUniforms.current.uFlameRise.value = 0;
        pointsUniforms.current.uFlameRise.value += 0.01;
    });

    return(
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
            />
        </Points>
    );
}