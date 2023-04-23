import notFoundImage from "../../assets/NotFound/404.jpg";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="not-found-container">
      <img
        className="not-found-image"
        src={notFoundImage}
        alt="Page not found"
      />
    </div>
  );
}

export default NotFound;
