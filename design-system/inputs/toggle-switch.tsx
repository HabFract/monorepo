
import { ToggleSwitch as FBSwitch } from "flowbite-react";
import { ToggleSwitchProps } from "./toggleswitch.stories";
import { useState } from "react";

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, errored, disabled } : ToggleSwitchProps) => {
  const [switch1, setSwitch1] = useState(false);

  return (
    <div className="flex max-w-md flex-col gap-4">
      <FBSwitch checked={switch1} disabled={disabled} label={label} onChange={setSwitch1} />
    </div>
  );
}

export default ToggleSwitch