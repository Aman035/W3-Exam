import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ThemeContext } from '../../contexts/Theme'
import './Header.scss'

function Header() {
  const { theme, setTheme } = useContext(ThemeContext)

  const handleThemeChange = () => {
    const isCurrentDark = theme === 'dark'
    setTheme(isCurrentDark ? 'light' : 'dark')
    localStorage.setItem('default-theme', isCurrentDark ? 'light' : 'dark')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Min-W3-Exam
      </Link>
      {/* <div className="toggle-btn-section">
        <button onClick={handleThemeChange} className="themeBtn">
          {theme === 'light' ? '🌞' : '🌙'}
        </button>
      </div> */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <button onClick={handleThemeChange} className="themeBtn">
            {theme === 'light' ? '🌞' : '🌙'}
          </button>
        </li>
        <li className="nav-item">
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/exams" className="nav-link">
            Exams
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/create-exam" className="nav-link">
            Create Exam
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Header
