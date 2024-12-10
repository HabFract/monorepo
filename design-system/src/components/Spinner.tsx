import "./common.css";

const Spinner: React.FC<{type?: string}> = ({ type = 'full' }) => {
  return (
    <span className={`${type}-spinner`}>
      <img src="assets/icon-sq.svg" alt='' aria-label="loading spinner" />
    </span>
  );
};

export default Spinner;