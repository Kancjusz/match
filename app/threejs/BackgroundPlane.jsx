import { useThree } from "@react-three/fiber";
import { useCallback } from "react";
import * as THREE from "three";

export default function BackgroundPlane({position,colorChange})
{
    const {viewport} = useThree()

    const randomPlaneColor = useCallback(()=>{
      const r = Math.random()*2;
      const g = Math.random()*2;
      const b = Math.random()*2;
      return new THREE.Color(r,g,b);
    },[colorChange]);

    return(
        <mesh position={position}>
          <planeGeometry args={[viewport.width,viewport.height]}/>
          <meshPhongMaterial color={randomPlaneColor()}/>
        </mesh>
    );
}