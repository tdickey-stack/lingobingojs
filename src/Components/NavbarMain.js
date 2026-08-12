import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function NavbarMain(props) {
  const activeClass = ({isActive}) => (
    isActive ? 'app-nav-link is-active' : 'app-nav-link'
  );

  return (
    <header className='app-header'>
      <div className='app-header-inner'>
        <NavLink className='app-brand' to='/'>
          <span className='app-brand-mark' aria-hidden='true'>
            <img src={`${process.env.PUBLIC_URL}/favicon.svg`} alt='' />
          </span>
          <span className='app-brand-name'>
            <strong>CrossPointe</strong><b>Bingo</b>
          </span>
        </NavLink>

        <nav className='app-nav' aria-label='Primary navigation'>
          <NavLink className={activeClass} to='/' end>Home</NavLink>
          <NavLink className={activeClass} to='/create'>Create</NavLink>
          <NavLink className={activeClass} to='/play'>Play</NavLink>
        </nav>

        <button
          className='theme-toggle'
          type='button'
          onClick={props.handleSwapTheme}
          aria-label={`Switch to ${props.theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${props.theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          <span aria-hidden='true'>{props.theme === 'dark' ? '☀' : '☾'}</span>
        </button>
      </div>
    </header>
  );
}

NavbarMain.propTypes = {
  handleSwapTheme: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired
};
