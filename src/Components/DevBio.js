import React from 'react';
import PropTypes from 'prop-types';

export default function DevBio(props) {
  return (
    <article className='profile-card' data-theme={props.dataTheme}>
      <div className='profile-heading'>
        <img src={props.img} alt={`Portrait of ${props.name}`} />
        <div>
          <h2>{props.name}</h2>
          <span>{props.pronouns}</span>
        </div>
      </div>
      <p>{props.bio}</p>
      <div className='profile-links'>
        <a className='button button-secondary' href={props.linkedin}>LinkedIn</a>
        <a className='button button-secondary' href={props.github}>GitHub</a>
      </div>
    </article>
  );
}

DevBio.propTypes = {
  img: PropTypes.string,
  name: PropTypes.string,
  pronouns: PropTypes.string,
  bio: PropTypes.string,
  linkedin: PropTypes.string,
  github: PropTypes.string,
  dataTheme: PropTypes.string
};
