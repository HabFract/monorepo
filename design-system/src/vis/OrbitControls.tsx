import { Button, getIconSvg } from "..";
import "./common.css";

export type OrbitControlsProps = {
  handleAppendNode: () => void;
  handleEdit: () => void;
};

const OrbitControls: React.FC<OrbitControlsProps> = ({ handleAppendNode, handleEdit }: OrbitControlsProps) => {
  return (
    <div className="orbit-controls-container">
        <Button type={"circle-icon"} icon={(getIconSvg("plus") as any)()} onClick={handleAppendNode} />
        <Button type={"circle-icon"} icon={(getIconSvg("pencil") as any)()} onClick={handleEdit} />
    </div>
  );
};

export default OrbitControls;
