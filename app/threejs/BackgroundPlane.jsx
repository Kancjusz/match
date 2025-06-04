import { useThree } from "@react-three/fiber";

export default function BackgroundPlane(props)
{
    const {viewport} = useThree()

    return(
        <mesh {...props}>
          <planeGeometry args={[viewport.width,viewport.height]}/>
          <meshPhongMaterial color={"#ffff00"}/>
        </mesh>
    );
}