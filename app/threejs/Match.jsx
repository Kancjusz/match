import { useGLTF } from '@react-three/drei';
import {vertexStick, fragmentStick, vertexHead, fragmentHead} from "./shaders/matchShader";
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import Fire from "./Fire";
import CustomShaderMaterial from 'three-custom-shader-material'
import * as THREE from "three";

export default function Match(props) {
  const { nodes, materials } = useGLTF('/models/match.glb')

  const maxDistance = 1;
  
  const yTipCoord = 1.5;

  const burnDirection = useRef(new THREE.Vector2(0,0));
  const burnProgress = useRef(yTipCoord);

  let burnProgressMemo = useRef(yTipCoord);
  let change = useRef(0);

  const headMaterial = useMemo(() => materials['Material.001'].clone(), []);
  const stickMaterial = useMemo(() => materials['Material.002'].clone(), []);

  useEffect(()=>{
    burnDirection.current = new THREE.Vector2((Math.random()-0.5)*2 * maxDistance,(Math.random()-0.5)*2 * maxDistance);
  },[])

  const matchPos = new THREE.Vector3(props.position[0],props.position[1],props.position[2]);
  const baseUniforms = {
    uBurnDirection:{value: burnDirection.current},
    uBurnProgress:{value: burnProgress.current},
    uMatchPos:{value: matchPos}
  }

  const uniformsHead = useMemo(()=>(baseUniforms),[]);
  const uniformsStick = useMemo(()=>(baseUniforms),[]);

  useFrame(()=>{
    burnProgressMemo.current -= 0.002;

    change.current = (yTipCoord - burnProgressMemo.current);

    uniformsHead.uBurnProgress.value = burnProgressMemo.current;
    uniformsStick.uBurnProgress.value = burnProgressMemo.current;
  });

  return (
    <group>
      <group {...props} dispose={null}>
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
      <Fire count={120000} origin={[0,0.3,90]} peakPoint={[0,6,90]} smokeColor={[0.5,0.5,0.5,0.5]} yDisplacement={0.7}
        fireColors={[[0,0,0,0],[0.6,0.9,1,0.05],[1,0.5,0,0.1],[1,1,0,0.4],[1,1,1,0.4],[1,1,0,0.4],[1,0.5,0,0.5]]}
        midDistanceColors={[[1,1,0,0.1],[1,0.5,0,0.1],[1,0.2,0,0.05]]} midColorStrength={0.7} size={1.5} change={change}
      />
      <pointLight position={[props.position[0],props.position[1]+5.5,props.position[2]+12]} color={"#ffaa00"} intensity={2} decay={0.5}/>
      <pointLight position={[props.position[0],props.position[1]+5.5,props.position[2]-1]} color={"#ffaa00"} intensity={2} decay={0.5}/>
      <pointLight position={[props.position[0]-1,props.position[1]+5.5,props.position[2]+10]} color={"#ffaa00"} intensity={2} decay={0.5}/>
      <pointLight position={[props.position[0]+1,props.position[1]+5.5,props.position[2]+10]} color={"#ffaa00"} intensity={2} decay={0.5}/>
    </group>
  )
}

useGLTF.preload('/models/match.glb')