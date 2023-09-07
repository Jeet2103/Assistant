import React from 'react';
import "../Home.css";

const Chat = ({ messages }) => {
    return (
    <>
      {messages.map((message, index) => (
            <div key={index} className='messages'>
                <span>{message.user} : {message.text}</span>
            </div>
      ))}
    </>
  );
};

export default Chat;