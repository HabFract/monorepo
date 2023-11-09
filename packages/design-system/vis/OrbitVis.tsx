import { Progress } from 'flowbite-react';
import { Scale } from "../../app/src/graphql/mocks/generated";
import './common.css'
import '../common.css'

type OrbitVisProps = {
  scale: Scale;
};

function getOrbitScalePercent(scale: Scale) : number {
  switch (scale) {
    case Scale.SUB:
      return 23
    case Scale.ATOM:
      return 30
    case Scale.ASTRO:
      return 100
  }
}

function getOrbitScaleImg(scale: Scale) {
  switch (scale) {
    case Scale.SUB:
      return { src: "../assets/orbits/scale-outlines-1.png", alt: "Orbit"}
    case Scale.ATOM:
      return { src: "../assets/orbits/scale-outlines-2.png", alt: "Orbit"}
    case Scale.ASTRO:
      return { src: "../assets/orbits/scale-outlines-3.png", alt: "Orbit"}
  }
}

const OrbitVis: React.FC<OrbitVisProps> = ({ scale }: OrbitVisProps) => {
  return (
    // @ts-ignore
    <div className="orbit-vis">
      <div>
        <img className="w-24" alt={getOrbitScaleImg(scale).alt} src={getOrbitScaleImg(scale).src} />
        <Progress className={scale.toLowerCase()} progress={getOrbitScalePercent(scale)} color="dark" />
        <label><div className="pt-1 text-center w-full">Scale</div></label>
      </div>
    </div>
  );
};

export default OrbitVis;
