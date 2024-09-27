import { Progress } from 'flowbite-react';
import { Scale } from "../generated-types";
import './common.css'
import '../common.css'

type OrbitVisProps = {
  scale: Scale;
};

function getOrbitScalePercent(scale: Scale) : number {
  switch (scale) {
    case Scale.Atom:
      return 20
    case Scale.Sub:
      return 25
    case Scale.Astro:
      return 100
  }
}

function getOrbitScaleImg(scale: Scale) {
  switch (scale) {
    case Scale.Atom:
      return { src: "assets/orbits/scale-outlines-1.png", alt: "Subatomic Orbit"}
    case Scale.Sub:
      return { src: "assets/orbits/scale-outlines-2.png", alt: "Atomic Orbit"}
    case Scale.Astro:
      return { src: "assets/orbits/scale-outlines-3.png", alt: "Astronomic Orbit"}
  }
}

const OrbitVis: React.FC<OrbitVisProps> = ({ scale }: OrbitVisProps) => {
  return (
    <div className="orbit-vis">
      <div>
        <img className="w-24" alt={getOrbitScaleImg(scale)?.alt} src={getOrbitScaleImg(scale)?.src} />
        <Progress className={scale.toLowerCase()} progress={getOrbitScalePercent(scale)} color="dark" />
        <label><div className="pt-1 mt-2 text-center w-full">Scale</div></label>
      </div>
    </div>
  );
};

export default OrbitVis;
