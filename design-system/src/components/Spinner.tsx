import { motion } from "framer-motion";
import "./common.css";

const Spinner: React.FC<{ type?: string }> = ({ type = 'full' }) => {
  return (
    <span className={`${type}-spinner`}>
      <img src="assets/icon-sq.svg" alt='' aria-label="loading spinner" />
    </span>
  );
};

export const SpinnerFallback = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="flex items-center justify-center w-full h-full"
  >
    <Spinner />
  </motion.div>
);

export default Spinner;