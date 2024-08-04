import React from 'react';

import './Magic.scss';

const initChat = () => {
  window.titleBar.chat.init();
};

export default () => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      initChat();
    }
  };

  return (
    <div
      id="magic-connector"
      onClick={initChat}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      @
    </div>
  );
};
