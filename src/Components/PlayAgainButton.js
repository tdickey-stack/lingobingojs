import PropTypes from 'prop-types';
import React from 'react';

export default function PlayAgainButton(props) {
  return (
    <button
      className='button button-primary'
      data-theme={props.dataTheme}
      type='button'
      onClick={props.handleClick}>
      {props.isBingoed ? 'Play Again' : 'Restart Game'}
    </button>
  );
}

PlayAgainButton.propTypes = {
  dataTheme: PropTypes.string,
  isBingoed: PropTypes.bool,
  handleClick: PropTypes.func
};
