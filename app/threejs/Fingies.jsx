import React, { createElement, useEffect, useRef, useState } from 'react'
import { useGLTF, useAnimations, Box } from '@react-three/drei'
import { Physics, RapierRigidBody, RigidBody, vec3 } from "@react-three/rapier";
import Match from "./Match";
import { useFrame } from '@react-three/fiber';
import * as THREE from "three";

export default function Fingies(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/fingies.glb')
  const { actions, names } = useAnimations(animations, group)

  const directions = [-1,1];
  const throwNames = ["ThrowLeft","ThrowRight"];

  const yMax = 4;
  const animationSpeed = 0.7;
  const burnProgress = useRef(yMax);
  const animationPlayed = useRef(false);

  const animationYBounds = 1.2;
  
  const flameCorrectRotation = useRef(new THREE.Euler(0,0,0));
  const prevEuler = useRef(new THREE.Euler(0,0,0));
  const matchVelocity = useRef(new THREE.Vector3(0,0,0));
  const wasPutOutRef = useRef(false);

  const rigidBodyProps = {
    position:[0,0,0],
    mass:1000, 
    lockRotations:true,
  }

  const [matchElement, setMatchElement] = useState(<Match {...{
        position:[0,20,90], 
        scale:[0.9,0.9,0.9],
        burnProgressPropRef:burnProgress,
        flameCorrectedRotationRef:flameCorrectRotation, 
        yTipCoord:yMax,
        matchVelocityRef:matchVelocity,
        wasPutOutRef:wasPutOutRef
      }} key={1}/>);
  const matchRigidBody = useRef(new RapierRigidBody());

  useEffect(()=>{
    const openClip = actions["Open"];
    openClip.setLoop(THREE.LoopOnce);
    openClip.setEffectiveTimeScale(1.2);
    openClip.clampWhenFinished = true;
    openClip.reset().play();

    setTimeout(()=>{
      openClip.clampWhenFinished = false;
      openClip.stop();

      const grabClip = actions["Grab"];
      grabClip.setLoop(THREE.LoopOnce);
      grabClip.setEffectiveTimeScale(0.95);
      grabClip.clampWhenFinished = true;
      grabClip.reset().fadeIn(0.9).fadeOut(0.5).play();
    },1750);
  },[])

  useFrame(()=>{
    matchVelocity.current = vec3(matchRigidBody.current.linvel());
    if(wasPutOutRef.current) return;

    burnProgress.current -= 0.001;

    if(burnProgress.current <= animationYBounds && !animationPlayed.current)
    {
      const randAnimationIndex = Math.round(Math.random());
      const clip = actions[throwNames[randAnimationIndex]];

      const direction = directions[randAnimationIndex];

      clip.setLoop(THREE.LoopOnce);
      clip.setEffectiveTimeScale(animationSpeed);
      clip.reset().fadeIn(0.5).fadeOut(0.9).play();
      animationPlayed.current = true;

      matchRigidBody.current.lockRotations(false,true);

      matchRigidBody.current.applyImpulse({ x: 70 * direction, y: 50, z: 0 }, true);
      matchRigidBody.current.applyTorqueImpulse({ x: 20, y: 0, z: 70 * -direction }, true);

      const openClip = actions["Open"];
      openClip.setLoop(THREE.LoopOnce);
      openClip.clampWhenFinished = true;
      openClip.reset().play();

      setTimeout(()=>{
        burnProgress.current = 1000;
        animationPlayed.current = false;
        
        const key = Math.random();
        
        flameCorrectRotation.current = new THREE.Euler(0,0,0);
        setMatchElement(<Match {...{
          position:[0,20,90], 
          scale:[0.9,0.9,0.9],
          burnProgressPropRef:burnProgress,
          flameCorrectedRotationRef:flameCorrectRotation, 
          yTipCoord:yMax,
          matchVelocityRef:matchVelocity,
          wasPutOutRef:wasPutOutRef
        }} key={key}/>);

        matchRigidBody.current.resetForces();
        matchRigidBody.current.resetTorques();
        matchRigidBody.current.setTranslation({x:0,y:0,z:0},true);
        matchRigidBody.current.setRotation({x:0,y:0,z:0,w:1},true);
        matchRigidBody.current.lockRotations(true,true);
        matchRigidBody.current.setLinvel({x:0,y:0,z:0},true);
        matchRigidBody.current.setAngvel({x:0,y:0,z:0},true);
 

        setTimeout(()=>{
          openClip.clampWhenFinished = false;
          openClip.stop();

          const grabClip = actions["Grab"];
          grabClip.setLoop(THREE.LoopOnce);
          grabClip.setEffectiveTimeScale(0.95);
          grabClip.clampWhenFinished = true;
          grabClip.reset().fadeIn(0.9).fadeOut(0.5).play();

          wasPutOutRef.current = false;
        },1750);
      },5000);
    }

    if(burnProgress.current != 1000)
    {
      const rotation = matchRigidBody.current.rotation();

      const rotationEuler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(rotation.x,rotation.y,rotation.z,rotation.w));

      flameCorrectRotation.current = new THREE.Euler(rotationEuler.x-prevEuler.current.x, rotationEuler.y-prevEuler.current.y, rotationEuler.z-prevEuler.current.z);

      prevEuler.current = rotationEuler;
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
        <RigidBody {...rigidBodyProps} ref={matchRigidBody} >
          {matchElement}
          {/*<Match position={[0,10,90]} scale={[0.9,0.9,0.9]} burnProgressPropRef={burnProgress} flameCorrectedRotationRef={flameCorrectRotation} matchRigidbodyRef={matchRigidBody} yTipCoord={yMax}/>*/}
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