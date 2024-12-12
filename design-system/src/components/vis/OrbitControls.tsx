import { Button, getIconSvg } from "../..";
import "./common.css";

export type OrbitControlsProps = {
  handleAppendNode: () => void;
  handleEdit: () => void;
  nodeEh: string;
};

const OrbitControls: React.FC<OrbitControlsProps> = ({ handleAppendNode, handleEdit, nodeEh }: OrbitControlsProps) => {
  return (
    <div className="orbit-controls-container" data-node-entry-hash={nodeEh}>
      <Button type={"button"} variant={"icon btn-primary"} icon={(getIconSvg("tree-vis") as any)()} onClick={handleAppendNode}>Add</Button>
      {/* <Button type={"button"} variant={"circle-icon btn-neutral"} icon={(getIconSvg("pencil") as any)()} onClick={handleEdit} /> */}
    </div>
  );
};

export default OrbitControls;
