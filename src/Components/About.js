import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DevBio from './DevBio.js';
import biodata from '../about-us/bio-data.json';
import Footer from './Footer.js';

export default function About() {
  const [theme] = useOutletContext();

  return (
    <div className='page-shell about-page' data-theme={theme}>
      <div className='page-intro'>
        <span className='eyebrow'>About the project</span>
        <h1>Created to help people stay present.</h1>
        <p>
          Lingo Bingo began as a lightweight way to make online presentations
          more participatory. It remains open source, approachable, and easy to use.
        </p>
      </div>

      <section className='profile-grid' aria-label='Project creators'>
        {biodata.data.map((developer, index) => (
          <DevBio
            key={index}
            dataTheme={theme}
            img={developer.img}
            name={developer.name}
            pronouns={developer.pronouns}
            bio={developer.bio}
            linkedin={developer.linkedin}
            github={developer.github}
          />
        ))}
      </section>
      <Footer dataTheme={theme} />
    </div>
  );
}
