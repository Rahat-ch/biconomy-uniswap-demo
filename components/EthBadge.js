import React, { useState } from 'react';

function EthBadge({ address }) {
  const [isCopied, setIsCopied] = useState(false);

  const truncateAddress = (address) => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // reset after 2 seconds
  };

  return (
    <button 
      onClick={copyToClipboard} 
      className="cursor-pointer flex items-center px-4 py-2 bg-transparent rounded-full shadow"
    >
      <svg className="w-12 h-12 mr-2" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#FFC107"/>
        <circle cx="16" cy="16" r="12" fill="#4CAF50"/>
        <circle cx="16" cy="16" r="8" fill="#F44336"/>
      </svg>
      {truncateAddress(address)}
      {isCopied && <span className="ml-2 text-green-200">Copied!</span>}
    </button>
  );
}

export default EthBadge;
