'use client';

import { Canvas } from "@react-three/fiber";
import Fingies from "./threejs/Fingies";
import BackgroundPlane from "./threejs/BackgroundPlane"
import { Suspense, useState } from "react";
import * as THREE from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from 'postprocessing'

export default function Home() {

  const [colorChange,setColorChange] = useState(false);

  return (
    <div className="h-[100vh] w-full absolute">
      <Canvas className="h-full w-full absolute bg-amber-700" camera={{position:[0,0,100]}} gl={{
          toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, outputColorSpace: THREE.SRGBColorSpace
        }}>
        <EffectComposer frameBufferType={THREE.HalfFloatType} depthBuffer={true}>
          <Bloom 
            blendFunction={BlendFunction.ADD}
            intensity={1} 
            luminanceThreshold={0.9} 
            luminanceSmoothing={0.0}
            mipmapBlur={true}
          />
        </EffectComposer>
        <BackgroundPlane position={[0,0,50]} colorChange={colorChange}/>
        <Suspense>
          <Fingies position={[-0.85,-14,89.2]} rotation={[0,-Math.PI/2.7,0]} setColorChange={()=>setColorChange(a=>!a)}/>
        </Suspense>
        <pointLight position={[-10,10,100]} color={"white"} intensity={35} decay={2}/>
        <pointLight position={[10,10,100]} color={"white"} intensity={35} decay={2}/>
      </Canvas>
    </div>
  );
}
