import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import "./Loader.scss";

const Loading = () => {
  return (
    <div className="loading">
      <FontAwesomeIcon icon={faSpinner} spin />
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
