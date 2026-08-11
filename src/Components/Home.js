import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavbarMain from './NavbarMain.js';
import '../CSS/root.css';


export default function Home() {
  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem('lingo-bingo-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('lingo-bingo-theme', theme);
  }, [theme]);

  const swapTheme = () => {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className='app-shell' data-theme={theme}>
      <NavbarMain
        handleSwapTheme={swapTheme}
        theme={theme}
      />
      <main className='app-main'>
        <Outlet context={[theme]}/>
      </main>
    </div>
  );
}
