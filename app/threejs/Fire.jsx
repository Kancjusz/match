import { Points } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { BufferAttribute, Vector2, Vector3 } from "three";
import {vertex, fragment} from "./shaders/fireParticlesShader";
import { useFrame } from "@react-three/fiber";

function fireFunction(y,length)
{
    return Math.sin(-3*y/(length*0.5))*Math.log10(y/(length*0.5));
}

export default function Fire({ count = 10000, origin = [0,0,0], peakPoint = [0,2,0] })
{
    const originVector = new Vector3(origin[0],origin[1],origin[2]);
    const peakVector = new Vector3(peakPoint[0],peakPoint[1],peakPoint[2]);
    const heightVector = new Vector3(origin[0],peakPoint[1],origin[2]);

    const yLength = originVector.distanceTo(peakVector);
    const sideDistance = heightVector.distanceTo(peakVector);

    const pointsUniforms = useRef({
        uTime: {value:0},
        uOriginPeakDistance: {value: yLength},
        uOriginPos: {value: originVector}
    });

    let basePositions = new Float32Array(3 * count);

    const peak2Normalized = (new Vector2(peakVector.x - originVector.x,peakVector.z - originVector.z)).normalize();

    for(let i = 0; i < count * 3; i+=3)
    {
        const y = Math.random() * yLength;
        const bounds = fireFunction(y,yLength);

        const xzVector = new Vector2(Math.random()*2-1,Math.random()*2-1);
        xzVector.normalize();

        const displacementMultiplier = (y <= yLength/2) ? (Math.pow(y/yLength,2)) : (Math.pow(((y/yLength)-Math.sqrt(y/yLength/2)),Math.log10(9)) + y/yLength/2);

        basePositions[i] = origin[0] + xzVector.x * bounds + peak2Normalized.x * sideDistance * displacementMultiplier;
        basePositions[i+1] = origin[1] + y;
        basePositions[i+2] = origin[2] + xzVector.y * bounds + peak2Normalized.y * sideDistance * displacementMultiplier;
    }

    useFrame(({clock})=>{
        pointsUniforms.current.uTime.value = clock.getElapsedTime(); 
        console.log(pointsUniforms.current.uOriginPos.value.z);
    });

    return(
        <Points positions={basePositions}>
            <shaderMaterial
                vertexShader={vertex}
                fragmentShader={fragment}
                alphaTest={true}
                depthTest={true}
                depthWrite={false}
                transparent={true}
                uniforms={pointsUniforms.current}
            />
        </Points>
    );
}