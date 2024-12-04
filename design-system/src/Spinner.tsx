import { Spinner as FBSpinner } from "flowbite-react";
import "./common.css";

const Spinner: React.FC<{type?: string}> = ({ type = 'full' }) => {
  return (
    <span className={`${type}-spinner`}>
      <FBSpinner aria-label="Loading!" size="xl" />
    </span>
  );
};

export default Spinner;