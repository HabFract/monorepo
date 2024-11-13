import { Button, getIconSvg } from "..";
import "./common.css";

export type OrbitControlsProps = {
  handleAppendNode: () => void;
  handleEdit: () => void;
  nodeEh: string;
};

const OrbitControls: React.FC<OrbitControlsProps> = ({ handleAppendNode, handleEdit, nodeEh }: OrbitControlsProps) => {
  return (
    <div className="orbit-controls-container" data-node-entry-hash={nodeEh}>
        <Button type={"button"} variant={"circle-icon btn-primary"} icon={(getIconSvg("plus") as any)()} onClick={handleAppendNode} />
        <Button type={"button"} variant={"circle-icon btn-neutral"} icon={(getIconSvg("pencil") as any)()} onClick={handleEdit} />
    </div>
  );
};

export default OrbitControls;
