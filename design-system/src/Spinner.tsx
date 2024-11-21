import { Spinner as FBSpinner } from "flowbite-react";
import "./common.css";

const Spinner: React.FC<{}> = ({ }) => {

  return (
    <span className="full-spinner">
      <FBSpinner aria-label="Loading!" size="xl" />
    </span>
  );
};

export default Spinner;