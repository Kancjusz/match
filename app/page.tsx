'use client';

import { Canvas, useThree } from "@react-three/fiber";
import Match from "./threejs/Match";
import BackgroundPlane from "./threejs/BackgroundPlane"

export default function Home() {

  return (
    <div className="h-[100vh] w-full absolute">
      <Canvas className="h-full w-full absolute bg-amber-700" camera={{position:[0,0,20]}}>
        {/*<directionalLight color={"#ffffff"} position={[0,0,11]} intensity={3}/>*/}
        <BackgroundPlane position={[0,0,5]}/>
        <Match position={[0,-1,10]} scale={[0.8,0.8,0.8]}/>
        <pointLight position={[0,3.5,12]} color={"#ffaa00"} intensity={2} decay={0.5}/>
        <pointLight position={[0,3.5,9]} color={"#ffaa00"} intensity={2} decay={0.5}/>
        <pointLight position={[-1,3.5,10]} color={"#ffaa00"} intensity={2} decay={0.5}/>
        <pointLight position={[1,3.5,10]} color={"#ffaa00"} intensity={2} decay={0.5}/>
      </Canvas>
    </div>
  );
}
