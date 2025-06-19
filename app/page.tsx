'use client';

import { Canvas } from "@react-three/fiber";
import Fingies from "./threejs/Fingies";
import BackgroundPlane from "./threejs/BackgroundPlane"
import { Suspense } from "react";
import * as THREE from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from 'postprocessing'

export default function Home() {

  return (
    <div className="h-[100vh] w-full absolute">
      <Canvas className="h-full w-full absolute bg-amber-700" camera={{position:[0,0,100]}} gl={{
          toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, outputColorSpace: THREE.SRGBColorSpace
        }}>
        {/*<directionalLight color={"#ffffff"} position={[0,0,11]} intensity={3}/>*/}
        <EffectComposer frameBufferType={THREE.HalfFloatType} depthBuffer={true}>
          <Bloom 
            blendFunction={BlendFunction.ADD}
            intensity={1} 
            luminanceThreshold={0.9} 
            luminanceSmoothing={0.0}
            mipmapBlur={true}
          />
        </EffectComposer>
        <BackgroundPlane position={[0,0,50]}/>
        <Suspense>
          <Fingies position={[-0.85,-14,89.2]} rotation={[0,-Math.PI/2.7,0]}/>
        </Suspense>
        <directionalLight color={"white"} position={[0,0,100]} intensity={0.05}/>
      </Canvas>
    </div>
  );
}
