import React from 'react';
import PropTypes from 'prop-types';

export default function Footer(props) {
  return (
    <footer className='app-footer' data-theme={props.dataTheme}>
      <span>Lingo Bingo</span>
      <p>
        Open source by <a href='https://github.com/EnigmaBay'>EnigmaBay</a> under the{' '}
        <a href='https://github.com/EnigmaBay/lingobingojs/blob/main/LICENSE'>MIT License</a>.
      </p>
    </footer>
  );
}

Footer.propTypes = {
  dataTheme: PropTypes.string
};
