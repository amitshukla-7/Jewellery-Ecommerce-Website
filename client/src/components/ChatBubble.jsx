import React from 'react';

const ChatBubble = () => {
  const whatsappNumber = '9198765XXXXX';
  const message = 'Hello Aura Jewels, I would like to inquire about your jewellery collection.';

  const openWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="chat-bubble" onClick={openWhatsApp}>
      <i className="fab fa-whatsapp" style={{ fontSize: '20px', color: '#25D366' }}></i>
      <span>Chat with us</span>
    </div>
  );
};

export default ChatBubble;
