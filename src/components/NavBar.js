import { useState } from 'react'
import  styles from './Navbar.module.css';

const NavBar = () => {
  const [isActive, setIsActive] = useState(false);
  const removeActive = () => {
    setIsActive(false)
  }
  return (
    <div className="Nav">
    <header className="Nav-header">
      <nav className={`${styles.navbar}`}>
        <a href='#' className={`${styles.logo}`}>Marine_Translate_Therm </a>
        <ul className={`${styles.navMenu} ${isActive ? styles.active : ''}`}>
          <li onClick={removeActive}>
            <a href='#branches' className={`${styles.navLink}`}>Branches</a>
          </li>
          <li onClick={removeActive}>
            <a href='#translate' className={`${styles.navLink}`}>Translate</a>
          </li>
          <li onClick={removeActive}>
            <a href='#changed' className={`${styles.navLink}`}>Changed</a>
          </li>
        </ul>
        <span className={`${styles.bar}`}></span>
      </nav>
    </header>
  </div>
  );
}

export default NavBar;