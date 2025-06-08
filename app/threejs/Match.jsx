import { useGLTF } from '@react-three/drei';
import {vertexStick, fragmentStick, vertexHead, fragmentHead} from "./shaders/matchShader";
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import CustomShaderMaterial from 'three-custom-shader-material'
import * as THREE from "three";

export default function Match(props) {
  const { nodes, materials } = useGLTF('/models/match.glb')

  const maxDistance = 1; 
  const yTipCoord = 3.5;

  const burnDirection = useRef(new THREE.Vector2(0,0));
  const burnProgress = useRef(yTipCoord);

  const headMaterial = useMemo(() => materials['Material.001'].clone(), []);
  const stickMaterial = useMemo(() => materials['Material.002'].clone(), []);

  useEffect(()=>{
    burnDirection.current = new THREE.Vector2((Math.random()-0.5)*2 * maxDistance,(Math.random()-0.5)*2 * maxDistance);
  },[])

  const uniformsHead = useMemo(()=>({
    uBurnDirection:{value: burnDirection.current},
    uBurnProgress:{value: burnProgress.current}
  }),[]);

  const uniformsStick = useMemo(()=>({
    uBurnDirection:{value: burnDirection.current},
    uBurnProgress:{value: burnProgress.current}
  }),[]);

  useFrame(()=>{
    console.log(uniformsHead.uBurnProgress.value);
    uniformsHead.uBurnProgress.value -= 0.0001;
  });

  return (
    <>
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
      <pointLight position={[props.position[0],props.position[1]+5.5,props.position[2]+12]} color={"#ffaa00"} intensity={2} decay={0.5}/>
      <pointLight position={[props.position[0],props.position[1]+5.5,props.position[2]-1]} color={"#ffaa00"} intensity={2} decay={0.5}/>
      <pointLight position={[props.position[0]-1,props.position[1]+5.5,props.position[2]+10]} color={"#ffaa00"} intensity={2} decay={0.5}/>
      <pointLight position={[props.position[0]+1,props.position[1]+5.5,props.position[2]+10]} color={"#ffaa00"} intensity={2} decay={0.5}/>
    </>
  )
}

useGLTF.preload('/models/match.glb')