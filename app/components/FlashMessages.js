import React, { useContext } from 'react';
import StateContext from '../StateContext';

function FlashMessages() {
  const state = useContext(StateContext);
  return (
    <div className="floating-alerts">
      {state.flashMessages &&
        state.flashMessages.map((msg, index) => {
          return (
            <div
              key={index}
              className="alert alert-success text-center floating-alert shadow-sm"
            >
              {msg}
            </div>
          );
        })}
    </div>
  );
}

export default FlashMessages;
