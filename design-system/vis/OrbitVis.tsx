import { Progress } from 'flowbite-react';
import { Scale } from "../../app/src/graphql/generated";
import './common.css'
import '../common.css'

type OrbitVisProps = {
  scale: Scale;
};

function getOrbitScalePercent(scale: Scale) : number {
  switch (scale) {
    case Scale.Sub:
      return 23
    case Scale.Atom:
      return 30
    case Scale.Astro:
      return 100
  }
}

function getOrbitScaleImg(scale: Scale) {
  switch (scale) {
    case Scale.Sub:
      return { src: "assets/orbits/scale-outlines-1.svg", alt: "Subatomic Orbit"}
    case Scale.Atom:
      return { src: "assets/orbits/scale-outlines-2.svg", alt: "Atomic Orbit"}
    case Scale.Astro:
      return { src: "assets/orbits/scale-outlines-3.svg", alt: "Astronomic Orbit"}
  }
}

const OrbitVis: React.FC<OrbitVisProps> = ({ scale }: OrbitVisProps) => {
  return (
    // @ts-ignore
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
