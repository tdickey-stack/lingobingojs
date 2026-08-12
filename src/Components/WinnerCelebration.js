import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CONFETTI = Array.from({ length: 44 }, (_, index) => {
  const column = index % 11;
  const row = Math.floor(index / 11);
  const direction = column - 5;
  const distance = direction * (22 + row * 4);
  const rotation = 180 + ((index * 83) % 540);

  return {
    id: index,
    className: `confetti-piece confetti-color-${index % 5}`,
    style: {
      '--confetti-x': `${distance}px`,
      '--confetti-mid-x': `${distance * 0.72}px`,
      '--confetti-burst-y': `${-70 - ((index * 17) % 120)}px`,
      '--confetti-fall-y': `${260 + ((index * 29) % 230)}px`,
      '--confetti-rotation': `${rotation}deg`,
      '--confetti-mid-rotation': `${rotation * 0.55}deg`,
      '--confetti-delay': `${(index % 7) * 24}ms`,
    },
  };
});

export default function WinnerCelebration({ winnerName, note, onClose }) {
  const closeButton = useRef(null);

  useEffect(() => {
    closeButton.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButton.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className='winner-celebration' role='presentation'>
      <div className='confetti-field' aria-hidden='true'>
        {CONFETTI.map((piece) => (
          <span className={piece.className} key={piece.id} style={piece.style} />
        ))}
      </div>
      <button
        className='winner-celebration-backdrop'
        type='button'
        tabIndex='-1'
        aria-label='Close winner announcement'
        onClick={onClose}
      />
      <section
        className='winner-celebration-card'
        role='dialog'
        aria-modal='true'
        aria-labelledby='winner-celebration-title'
        aria-describedby='winner-celebration-description'
      >
        <div className='winner-celebration-icon' aria-hidden='true'>✓</div>
        <span className='eyebrow'>We have a winner</span>
        <h2 id='winner-celebration-title'>Bingo!</h2>
        <p id='winner-celebration-description'>
          <strong>{winnerName}</strong> got Bingo!
        </p>
        <span className='winner-celebration-note'>{note}</span>
        <button
          className='button button-primary winner-celebration-action'
          type='button'
          ref={closeButton}
          onClick={onClose}
        >
          Keep playing
        </button>
      </section>
    </div>
  );
}

WinnerCelebration.propTypes = {
  winnerName: PropTypes.string.isRequired,
  note: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

WinnerCelebration.defaultProps = {
  note: 'The room stays open for more winners.',
};
