import {Html, useProgress} from "@react-three/drei";

export default function Loader() {
  const { active, progress, errors, item, loaded, total } = useProgress()

  return <Html center style={{color:"white"}}>
        <p style={{textAlign:"center", fontSize:"2em"}}>{progress.toFixed(0)} % loaded</p>
        <progress max={100} value={progress} style={{width:"200px", height:"50px"}}/>
    </Html>
}