'use client';

import { Canvas } from "@react-three/fiber";
import Fingies from "./threejs/Fingies";
import BackgroundPlane from "./threejs/BackgroundPlane"
import { Suspense, useState } from "react";
import * as THREE from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from 'postprocessing'
import { PerspectiveCamera, useDetectGPU } from "@react-three/drei";
//import { Perf } from "r3f-perf";

export default function Home() {

  const [colorChange,setColorChange] = useState(false);
  const GPU = useDetectGPU();
  const isMobile = (GPU.tier === 0 || GPU.isMobile);
  const intensityModifier = (isMobile ? 2 : 1);

  return (
    <div className="h-full w-full absolute">
      <Canvas className="h-full w-full absolute bg-amber-700" gl={{
          toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, outputColorSpace: THREE.SRGBColorSpace
        }}>
        {/*<Perf 
          matrixUpdate
          deepAnalyze
          overClock/>*/}
        {/*<Stats/>*/}
        <PerspectiveCamera makeDefault position={[0,0,100]} fov={75}/>
        
        {!isMobile && <EffectComposer>
          <Bloom 
            levels={9}
            intensity={1} 
            luminanceThreshold={0.9} 
            luminanceSmoothing={0.0}
            kernelSize={KernelSize.VERY_SMALL}
            mipmapBlur={true}
          />
        </EffectComposer>}
        <BackgroundPlane position={[0,0,50]} colorChange={colorChange}/>
        <Suspense>
          <Fingies position={[-0.85,-14,89.2]} rotation={[0,-Math.PI/2.7,0]} setColorChange={()=>setColorChange(a=>!a)}/>
        </Suspense>
        <pointLight position={[-10,10,100]} color={"white"} intensity={35 * intensityModifier} decay={2}/>
        <pointLight position={[10,10,100]} color={"white"} intensity={35 * intensityModifier} decay={2}/>
      </Canvas>
    </div>
  );
}
