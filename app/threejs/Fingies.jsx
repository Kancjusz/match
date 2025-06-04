import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function Fingies(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/fingies.glb')
  const { actions } = useAnimations(animations, group)
  return (
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
  )
}

useGLTF.preload('/models/fingies.glb')