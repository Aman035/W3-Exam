import { useEffect, useState, useMemo } from 'react'
import './Home.scss'
import studentImage from '../../assets/Home/student.png'

const Home = () => {
  const phrases = useMemo(
    () => [
      'Conduct secure online exams',
      'Ensure exam integrity',
      'Enabling remote exam access',
      'Leverage the power of decentralisation',
    ],
    []
  )

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length)
    }, 2000)
    return () => clearInterval(intervalId)
  }, [phrases])

  useEffect(() => {
    setCurrentPhrase(phrases[currentPhraseIndex])
  }, [currentPhraseIndex, phrases])

  return (
    <div className="containerHome">
      <div className="image-container">
        <img src={studentImage} alt="Student" />
      </div>
      <div className="text-container">
        <h1 className="homeTitle">{currentPhrase}</h1>
      </div>
    </div>
  )
}

export default Home
