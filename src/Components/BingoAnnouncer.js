import React from 'react';
import PropTypes from 'prop-types';

export default function BingoAnnouncer(props) {
  return (
    <div
      className={props.classname}
      role='status'
      aria-live='polite'
    >
      <span className='winner-icon' aria-hidden='true'>✓</span>
      <span>
        <strong>BINGO!</strong>
        <small>{props.text}</small>
      </span>
    </div>
  );
}

BingoAnnouncer.propTypes = {
  classname: PropTypes.string,
  text: PropTypes.string,
};
