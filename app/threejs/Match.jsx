import { useGLTF } from '@react-three/drei';
import {vertexStick, fragmentStick, vertexHead, fragmentHead} from "./shaders/matchShader";
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import Fire from "./Fire";
import CustomShaderMaterial from 'three-custom-shader-material'
import * as THREE from "three";

export default function Match({
  position, scale, yTipCoord = 1.5, maxDistance = 0.5, timeMultiplier = 0.001,  
  burnProgressPropRef = null, flameCorrectedRotationRef = null, matchVelocityRef = null
}) {
  const { nodes, materials } = useGLTF('/models/match.glb')
  const peakPoint = [0,6,90];

  const burnDirection = useRef(new THREE.Vector2((Math.random()-0.5)*2 * maxDistance,(Math.random()-0.5)*2 * maxDistance));

  let burnProgress = useRef(yTipCoord);
  let change = useRef(0);

  const headMaterial = useMemo(() => materials['Material.001'].clone(), []);
  const stickMaterial = useMemo(() => materials['Material.002'].clone(), []);

  const matchPos = new THREE.Vector3(position[0],position[1],position[2]);
  const baseUniforms = {
    uBurnDirection:{value: burnDirection.current},
    uBurnProgress:{value: burnProgress.current},
    uMatchPos:{value: matchPos},
    uMaxHeight:{value: yTipCoord}
  }

  const uniformsHead = useMemo(()=>(baseUniforms),[]);
  const uniformsStick = useMemo(()=>(baseUniforms),[]);

  const fireGroupRef = useRef(new THREE.Group());
  
  const peakDisplacementMultiplier = 0.2;
  const peakDisplacementVector = useCallback(()=>{
    const matchVel = matchVelocityRef.current;
    return (
      [
        -matchVel.x * peakDisplacementMultiplier + peakPoint[0],
        -matchVel.y * peakDisplacementMultiplier + peakPoint[1],
        -matchVel.z * peakDisplacementMultiplier + peakPoint[2],
      ]
    );
  },[matchVelocityRef.current]);

  useEffect(()=>{
    burnDirection.current = new THREE.Vector2((Math.random()-0.5)*2 * maxDistance,(Math.random()-0.5)*2 * maxDistance);
  },[]);

  useFrame(()=>{
    burnProgress.current = (burnProgressPropRef == null) ? (burnProgress.current - 1 * timeMultiplier) : burnProgressPropRef.current;

    change.current = (yTipCoord - burnProgress.current);

    uniformsHead.uBurnProgress.value = burnProgress.current;
    uniformsStick.uBurnProgress.value = burnProgress.current;

    const euler = flameCorrectedRotationRef.current;

    if(burnProgressPropRef.current >= 999)
    {
      euler.z = 0;
      burnProgressPropRef.current = yTipCoord;
    }

    fireGroupRef.current.position.set(0,matchPos.y+yTipCoord-1.5-change.current,0);
    fireGroupRef.current.rotateOnAxis(new THREE.Vector3(0,0,1),-euler.z);
  });

  return (
    <group>
      <group position={position} scale={scale} dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001.geometry}>
          <CustomShaderMaterial 
            baseMaterial={headMaterial} 
            vertexShader={vertexHead} 
            fragmentShader={fragmentHead} 
            uniforms={uniformsHead}/>
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_1.geometry}>
          <CustomShaderMaterial 
            baseMaterial={stickMaterial} 
            vertexShader={vertexStick} 
            fragmentShader={fragmentStick} 
            uniforms={uniformsStick}/>
        </mesh>
      </group>
      <group position={[0,matchPos.y+yTipCoord-1.5,0]} ref={fireGroupRef}>
        <Fire count={120000} origin={[0,-0.2,90]} 
          peakPoint={peakPoint} 
          peakPointCallback={peakDisplacementVector}
          smokeColor={[0.5,0.5,0.5,0.05]} yDisplacement={0.7}
          fireColors={[[0,0,0,0],[0.6,0.9,1,0.005],[1,0.5,0,0.1],[1,1,0,0.4],[1,1,1,0.4],[1,1,0,0.4],[1,0.5,0,0.5]]}
          midDistanceColors={[[1,1,0,0.01],[1,0.5,0,0.02],[1,0.1,0,0.05]]} midColorStrength={0.7} size={1.5} change={change}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/match.glb')