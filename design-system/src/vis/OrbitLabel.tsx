import FrequencyIndicator from "../icons/FrequencyIndicator";
import "./common.css";
import { OrbitNodeDetails } from "@ui/src/state";

export type OrbitLabelProps = {
  orbitDetails: Partial<OrbitNodeDetails>;
};

const OrbitLabel: React.FC<OrbitLabelProps> = ({ orbitDetails }: OrbitLabelProps) => {
  return (
    <div className="orbit-label-container">
      <h2>{orbitDetails.name}
        
      <FrequencyIndicator frequency={orbitDetails.frequency!} size="sm"></FrequencyIndicator>
      </h2>
      <p>{orbitDetails.description}</p>
    </div>
  );
};

export default OrbitLabel;
