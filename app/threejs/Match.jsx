import { useGLTF } from '@react-three/drei'

export default function Match(props) {
  const { nodes, materials } = useGLTF('/models/match.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube001.geometry}
        material={materials['Material.001']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube001_1.geometry}
        material={materials['Material.002']}
      />
    </group>
  )
}

useGLTF.preload('/models/match.glb')