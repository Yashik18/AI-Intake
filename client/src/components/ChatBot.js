// ChatBot.js
import React, { useState } from 'react';
import './ChatBot.css';
import axios from 'axios';

const ChatBot = () => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setShowChat(!showChat);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { from: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5001/chat', {
        question: userInput,
      });
      setMessages([...newMessages, { from: 'bot', text: res.data.answer }]);
    } catch (err) {
      setMessages([...newMessages, { from: 'bot', text: 'Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbot-wrapper">
      <button className="chatbot-toggle" onClick={toggleChat}>
        💬
      </button>

      {showChat && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <span>ProcUrPal AI Assistant</span>
            <button onClick={toggleChat}>✕</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.from}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="chatbot-msg bot">Typing...</div>}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask a question..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
