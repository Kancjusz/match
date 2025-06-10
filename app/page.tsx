'use client';

import { Canvas } from "@react-three/fiber";
import Fingies from "./threejs/Fingies";
import BackgroundPlane from "./threejs/BackgroundPlane"
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

export default function Home() {

  return (
    <div className="h-[100vh] w-full absolute">
      <Canvas className="h-full w-full absolute bg-amber-700" camera={{position:[0,0,100]}} gl={{
          toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, outputColorSpace: THREE.SRGBColorSpace
        }}>
        {/*<directionalLight color={"#ffffff"} position={[0,0,11]} intensity={3}/>*/}
        <OrbitControls/>
        <BackgroundPlane position={[0,0,50]}/>
        <Suspense>
          <Fingies position={[-0.85,-14,89.2]} rotation={[0,-Math.PI/2.7,0]}/>
        </Suspense>
      </Canvas>
    </div>
  );
}
