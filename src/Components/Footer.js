import React from 'react';
import PropTypes from 'prop-types';

export default function Footer(props) {
  return (
    <footer className='app-footer' data-theme={props.dataTheme}>
      <span>CrossPointe Bingo</span>
      <p>
        Based on the open-source LingoBingoJS project ·{' '}
        <a href='https://github.com/tdickey-stack/lingobingojs/blob/main/LICENSE'>MIT License</a>
      </p>
    </footer>
  );
}

Footer.propTypes = {
  dataTheme: PropTypes.string
};
