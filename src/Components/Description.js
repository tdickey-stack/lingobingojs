import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Footer from './Footer.js';

export default function Description() {
  const [theme] = useOutletContext();

  return (
    <div className='page-shell landing-page' data-theme={theme}>
      <section className='hero-panel'>
        <div className='hero-copy'>
          <span className='eyebrow'>Listen. Mark. Connect.</span>
          <h1>Make every gathering more engaging.</h1>
          <p>
            Lingo Bingo gives your group a simple, shared way to listen for the
            words and ideas that matter most.
          </p>
          <div className='hero-actions'>
            <Link className='button button-primary' to='/create'>Create a game</Link>
            <Link className='button button-secondary' to='/play'>Try the demo board</Link>
          </div>
        </div>

        <div className='hero-board-preview' aria-hidden='true'>
          {['WELCOME', 'NEXT STEP', 'COMMUNITY', 'SERVE', 'FREE', 'TOGETHER', 'GROW', 'CARE', 'PRAY'].map((word, index) => (
            <span className={index === 4 ? 'is-accent' : ''} key={word}>{word}</span>
          ))}
        </div>
      </section>

      <section className='content-section' aria-labelledby='how-it-works'>
        <div className='section-heading'>
          <span className='eyebrow'>How it works</span>
          <h2 id='how-it-works'>Ready in a few simple steps.</h2>
          <p>Built for presentations, team gatherings, classes, and community events.</p>
        </div>
        <div className='step-grid'>
          <article className='info-card'>
            <span className='step-number'>01</span>
            <h3>Add your phrases</h3>
            <p>Choose 24 words or short phrases your audience should listen for.</p>
          </article>
          <article className='info-card'>
            <span className='step-number'>02</span>
            <h3>Share one link</h3>
            <p>Send the game link to your group. Each person gets a shuffled board.</p>
          </article>
          <article className='info-card'>
            <span className='step-number'>03</span>
            <h3>Play together</h3>
            <p>Tap phrases as they come up. Five marked squares in a row wins.</p>
          </article>
        </div>
      </section>

      <Footer dataTheme={theme} />
    </div>
  );
}
