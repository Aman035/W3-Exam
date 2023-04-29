import "./EnrollForm.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface Iprops {
  enrollData: {
    name: string;
    phone: string;
  };
  enrolling: boolean;
  handleEnrollSubmit: (e: any) => void;
  setEnrollData: (newstate: any) => void;
  handleCloseEnrollForm: () => void;
}

const EnrollForm = (props: Iprops) => {
  return (
    <div className="enroll-modal">
      <button className="close-button" onClick={props.handleCloseEnrollForm}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <form onSubmit={props.handleEnrollSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={props.enrollData.name}
          onChange={(e) =>
            props.setEnrollData({ ...props.enrollData, name: e.target.value })
          }
          placeholder="Enter your name"
          required
        />
        <label>Phone:</label>
        <PhoneInput
          value={props.enrollData.phone}
          onChange={(value) =>
            props.setEnrollData({ ...props.enrollData, phone: value })
          }
          placeholder="Enter phone number"
          defaultCountry="IN"
          international
          required
        />
        <button type="submit" className="enroll-submit-button">
          {props.enrolling ? "Enrolling..." : "Enroll"}
        </button>
      </form>
    </div>
  );
};

export default EnrollForm;
