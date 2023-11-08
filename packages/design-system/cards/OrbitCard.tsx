import './cardStyles.css';
import { EditOutlined, DeleteOutlined, PieChartOutlined } from '@ant-design/icons'; // Import icons
import { Orbit } from '../../app/src/graphql/mocks/generated';
import OrbitVis from '../vis/OrbitVis';

type OrbitCardProps = {
  orbit: Orbit;
};

const OrbitCard: React.FC<OrbitCardProps> = ({ orbit }: OrbitCardProps) => {
  // console.log('orbit :>> ', orbit);
  return (
    // @ts-ignore
    <div className="orbit-card flex flex-col rounded-lg">
      <header className="orbit-header flex bg-white rounded-t-lg items-center justify-around">
        <div className="orbit-title">
          <h2 className="card-name">{orbit.name}</h2>
        </div>
        <div className="orbit-timeframe flex flex-col items-center">
          <p>Last tracked:</p>
          <p>{new Date(orbit?.timeframe.startTime).toLocaleDateString('en-GB')}</p>
        </div>
      </header>
      <div className="orbit-description flex items-center justify-center">
        <p>{orbit.metadata?.description}</p>
      </div>
      <div className="flex justify-around items-center">
        <div className="orbit-actions flex flex-col justify-center">
          <div className="orbit-actions-crud flex flex-1 justify-center">
            <button className="flex-1 bg-blue-100">
              <EditOutlined />
              Edit
            </button>
            <button className="flex-1 bg-red-100">
              <DeleteOutlined />
              Delete
            </button>
          </div>

          <div className="orbit-actions-vis bg-gray-100 flex flex-1 justify-center">
            <button>
              <PieChartOutlined />
              Visualise
            </button>
          </div>
        </div>

        <div className="mini-vis flex items-center justify-center">
          {orbit?.metadata?.scale && <OrbitVis scale={orbit.metadata.scale} />}
        </div>
      </div>
    </div>
  );
};

export default OrbitCard;
