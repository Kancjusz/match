import { useGLTF } from '@react-three/drei';
import {vertexStick, fragmentStick, vertexHead, fragmentHead} from "./shaders/matchShader";
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import Fire from "./Fire";
import CustomShaderMaterial from 'three-custom-shader-material'
import * as THREE from "three";
import { Select } from '@react-three/postprocessing';

export default function Match({position, scale, yTipCoord = 1.5, maxDistance = 0.5, timeMultiplier = 0.001,  burnProgressPropRef = null}) {
  const { nodes, materials } = useGLTF('/models/match.glb')

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

  useFrame(()=>{
    burnProgress.current = (burnProgressPropRef == null) ? (burnProgress.current - 1 * timeMultiplier) : burnProgressPropRef.current;

    change.current = (yTipCoord - burnProgress.current);

    uniformsHead.uBurnProgress.value = burnProgress.current;
    uniformsStick.uBurnProgress.value = burnProgress.current;
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
      <Fire count={120000} origin={[0,0.3,90]} peakPoint={[0,6,90]} smokeColor={[0.5,0.5,0.5,0.05]} yDisplacement={0.7}
        fireColors={[[0,0,0,0],[0.6,0.9,1,0.005],[1,0.5,0,0.1],[1,1,0,0.4],[1,1,1,0.4],[1,1,0,0.4],[1,0.5,0,0.5]]}
        midDistanceColors={[[1,1,0,0.01],[1,0.5,0,0.02],[1,0.1,0,0.05]]} midColorStrength={0.7} size={1.5} change={change}
      />
      
      <pointLight position={[position[0],position[1]+5.5,position[2]+12]} color={"#ff9955"} intensity={2000} decay={4}/>
      <pointLight position={[position[0],position[1]+5.5,position[2]-1]} color={"#ff9955"} intensity={2000} decay={4}/>
      <pointLight position={[position[0]-1,position[1]+5.5,position[2]+10]} color={"#ff9955"} intensity={2000} decay={4}/>
      <pointLight position={[position[0]+1,position[1]+5.5,position[2]+10]} color={"#ff9955"} intensity={2000} decay={4}/>

    </group>
  )
}

useGLTF.preload('/models/match.glb')