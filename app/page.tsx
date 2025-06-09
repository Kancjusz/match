'use client';

import { Canvas, useThree } from "@react-three/fiber";
import Match from "./threejs/Match";
import Fingies from "./threejs/Fingies";
import BackgroundPlane from "./threejs/BackgroundPlane"
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

export default function Home() {

  return (
    <div className="h-[100vh] w-full absolute">
      <Canvas className="h-full w-full absolute bg-amber-700" camera={{position:[0,0,100]}}>
        {/*<directionalLight color={"#ffffff"} position={[0,0,11]} intensity={3}/>*/}
        <OrbitControls/>
        <BackgroundPlane position={[0,0,50]}/>
        <Suspense>
          <Match position={[0,-2,90]} scale={[0.9,0.9,0.9]}/>
          <Fingies position={[-0.85,-14,89.2]} rotation={[0,-Math.PI/2.7,0]}/>
        </Suspense>
      </Canvas>
    </div>
  );
}
