import React, { useRef } from 'react'
import { useGLTF, useAnimations, Box } from '@react-three/drei'
import { Physics, RigidBody } from "@react-three/rapier";
import Match from "./Match";
import { useFrame } from '@react-three/fiber';
import * as THREE from "three";

export default function Fingies(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/fingies.glb')
  const { actions } = useAnimations(animations, group)

  const actionNames = ['ThrowRight','ThrowLeft'];
  const directions = [1,-1];

  const yMax = 1.5;
  const animationSpeed = 0.7;
  const burnProgress = useRef(yMax);
  const animationPlayed = useRef(false);

  const animationYBounds = -1;
  
  const matchRigidBody = useRef();

  useFrame(()=>{
    burnProgress.current -= 0.002;

    if(burnProgress.current <= animationYBounds && !animationPlayed.current)
    {
      const randAnimationIndex = Math.round(Math.random());
      const clip = actions[actionNames[randAnimationIndex]];

      const direction = directions[randAnimationIndex];

      clip.setLoop(THREE.LoopOnce);
      clip.setEffectiveTimeScale(animationSpeed);
      clip.play();
      animationPlayed.current = true;

      //burnProgress.current = yMax;
      matchRigidBody.current.applyImpulse({ x: 70 * direction, y: 50, z: 0 }, true);
      matchRigidBody.current.applyTorqueImpulse({ x: 20, y: 0, z: 70 * -direction }, true);

      setTimeout(()=>{
        window.location.reload();
        //burnProgress.current = 0;
      },3000);
    }
  });

  return (
    <group>
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group name="Armature">
            <group name="Cube">
              <skinnedMesh
                name="Cube001"
                geometry={nodes.Cube001.geometry}
                material={materials['Material.001']}
                skeleton={nodes.Cube001.skeleton}
              />
              <skinnedMesh
                name="Cube001_1"
                geometry={nodes.Cube001_1.geometry}
                material={materials['Material.002']}
                skeleton={nodes.Cube001_1.skeleton}
              />
            </group>
            <primitive object={nodes.Bone} />
          </group>
        </group>
      </group>
      <Physics>
        <RigidBody ref={matchRigidBody} mass={1000}>
          <Match position={[0,-2,90]} scale={[0.9,0.9,0.9]} burnProgressPropRef={burnProgress}/>
        </RigidBody>
        <RigidBody type='fixed'>
          <Box position={[0,-4.9,90]} args={[1,1,1]} receiveShadow={false} castShadow={false}>
            <meshStandardMaterial opacity={0} transparent={true}/>
          </Box>
        </RigidBody>
      </Physics>
    </group>
  )
}

useGLTF.preload('/models/fingies.glb')