import React from 'react';
import PropTypes from 'prop-types';

export default function WordTile(props) {
  return (
    <span className='square-label'>
      {props.word}
    </span>
  );
}
WordTile.propTypes = {
  word: PropTypes.string,
};
