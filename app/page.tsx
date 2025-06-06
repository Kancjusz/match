'use client';

import { Canvas, useThree } from "@react-three/fiber";
import Match from "./threejs/Match";
import Fingies from "./threejs/Fingies";
import Fire from "./threejs/Fire";
import BackgroundPlane from "./threejs/BackgroundPlane"
import { OrbitControls } from "@react-three/drei";

export default function Home() {

  return (
    <div className="h-[100vh] w-full absolute">
      <Canvas className="h-full w-full absolute bg-amber-700" camera={{position:[0,0,100]}}>
        {/*<directionalLight color={"#ffffff"} position={[0,0,11]} intensity={3}/>*/}
        <OrbitControls/>
        <BackgroundPlane position={[0,0,50]}/>
        <Match position={[0,-2,90]} scale={[0.9,0.9,0.9]}/>
        <Fingies position={[-0.85,-14,89.2]} rotation={[0,-Math.PI/2.7,0]}/>
        <pointLight position={[0,3.5,102]} color={"#ffaa00"} intensity={2} decay={0.5}/>
        <pointLight position={[0,3.5,89]} color={"#ffaa00"} intensity={2} decay={0.5}/>
        <pointLight position={[-1,3.5,100]} color={"#ffaa00"} intensity={2} decay={0.5}/>
        <pointLight position={[1,3.5,100]} color={"#ffaa00"} intensity={2} decay={0.5}/>
        <Fire origin={[0,0.5,90]} peakPoint={[5,5.5,90]} smokeColor={[0.5,0.5,0.5,1]}
          fireColors={[[0,0,0,0],[0.6,0.9,1,0.01],[1,0.5,0,0.1],[1,1,0,0.4],[1,1,1,0.4],[1,1,0,0.4],[1,0.5,0,0.5]]}
        />
      </Canvas>
    </div>
  );
}
