import { Scale } from "../../app/src/graphql/mocks/generated";

type OrbitVisProps = {
  scale: Scale;
};


const OrbitVis: React.FC<OrbitVisProps> = ({ scale }: OrbitVisProps) => {
  return (
    // @ts-ignore
    <div className="orbit-vis">
      {scale}
    </div>
  );
};

export default OrbitVis;
