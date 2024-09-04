import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

const NavBar = () => {
  const [isBranch, setIsBranch] = useState(false);

  useEffect(() => {
    const branchExists = sessionStorage.getItem('branch');
    if (branchExists) {
      setIsBranch(true);
    }
  }, []);

  return (
    <div className="Nav">
      <header className="Nav-header">
        <nav className={`${styles.navbar}`}>
          <a href='#' className={`${styles.logo}`}>Marine_Translate_Term </a>
          <ul className={`${styles.navMenu}`}>
            <li>
              <a href='#branches' className={`${styles.navLink}`}>Branches</a>
            </li>
            {isBranch && (
              <>
                <li>
                  <a href='#translate' className={`${styles.navLink}`}>Translate</a>
                </li>
                <li>
                  <a href='#changed' className={`${styles.navLink}`}>Changed</a>
                </li>
              </>
            )}
          </ul>
          <span className={`${styles.bar}`}></span>
        </nav>
      </header>
    </div>
  );
}

export default NavBar;
