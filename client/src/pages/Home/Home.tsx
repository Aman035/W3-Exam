import React, {useEffect, useState} from "react";
import './Home.scss';
import studentImage from "../../assets/Home/student.png";
function Home() {
  const phrases = ["Conduct secure online exams", "Ensure exam integrity", "Enabling remote exam access", "Leverage the power of decentralisation"];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
      setCurrentPhraseIndex(nextPhraseIndex);
      setCurrentPhrase(phrases[nextPhraseIndex]);
    }, 2000);
    return () => clearInterval(intervalId);
  }, [currentPhraseIndex, phrases]);

  return (
    <div className="containerHome">
      <div className="image-container">
        <img src={studentImage} alt="Student" />
      </div>
      <div className="text-container">
        <h1 className="homeTitle">{currentPhrase}</h1>
      </div>
    </div>
  );
}

export default Home;
