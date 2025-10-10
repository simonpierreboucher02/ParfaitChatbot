(function() {
  'use strict';
  
  // Get configuration from script tag
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const botId = currentScript.getAttribute('data-bot');
  const apiUrl = currentScript.src.replace('/widget.js', '');
  
  if (!botId) {
    console.error('AgentiLab Widget: data-bot attribute is required');
    return;
  }

  // Create widget styles
  const styles = `
    .agentilab-widget-container {
      position: fixed;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    .agentilab-widget-container.position-right {
      right: 24px;
      bottom: 24px;
    }
    
    .agentilab-widget-container.position-left {
      left: 24px;
      bottom: 24px;
    }
    
    .agentilab-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .agentilab-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    
    .agentilab-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    
    .agentilab-widget-chat {
      position: absolute;
      bottom: 80px;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    
    .agentilab-widget-chat.active {
      display: flex;
    }
    
    .agentilab-widget-container.position-right .agentilab-widget-chat {
      right: 0;
    }
    
    .agentilab-widget-container.position-left .agentilab-widget-chat {
      left: 0;
    }
    
    .agentilab-widget-header {
      padding: 20px;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .agentilab-widget-logo {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      object-fit: cover;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .agentilab-widget-title {
      flex: 1;
    }
    
    .agentilab-widget-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .agentilab-widget-title p {
      margin: 2px 0 0;
      font-size: 12px;
      opacity: 0.9;
    }
    
    .agentilab-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    
    .agentilab-widget-close:hover {
      opacity: 1;
    }
    
    .agentilab-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f9fafb;
    }
    
    .agentilab-widget-message {
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
    }
    
    .agentilab-widget-message.user {
      flex-direction: row-reverse;
    }
    
    .agentilab-widget-message-content {
      max-width: 75%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .agentilab-widget-message.assistant .agentilab-widget-message-content {
      background: white;
      border: 1px solid #e5e7eb;
    }
    
    .agentilab-widget-message.user .agentilab-widget-message-content {
      background: var(--primary-color);
      color: white;
    }
    
    .agentilab-widget-input-container {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }
    
    .agentilab-widget-input {
      flex: 1;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }
    
    .agentilab-widget-input:focus {
      border-color: var(--primary-color);
    }
    
    .agentilab-widget-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--primary-color);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }
    
    .agentilab-widget-send:hover {
      opacity: 0.9;
    }
    
    .agentilab-widget-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .agentilab-widget-typing {
      padding: 8px 16px;
      background: white;
      border-radius: 16px;
      display: inline-block;
      border: 1px solid #e5e7eb;
    }
    
    .agentilab-widget-typing span {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      margin: 0 2px;
      animation: typing 1.4s infinite;
    }
    
    .agentilab-widget-typing span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .agentilab-widget-typing span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }
    
    @media (max-width: 480px) {
      .agentilab-widget-chat {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
      }
    }
  `;
  
  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Fetch chatbot configuration
  let config = {
    name: 'AI Assistant',
    primaryColor: '#8b5cf6',
    position: 'right',
    logoUrl: null
  };
  
  let sessionId = localStorage.getItem('agentilab_session_' + botId);
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('agentilab_session_' + botId, sessionId);
  }
  
  fetch(`${apiUrl}/api/chatbot`)
    .then(res => res.json())
    .then(data => {
      if (data) {
        config = {
          name: data.name || 'AI Assistant',
          primaryColor: data.primaryColor || '#8b5cf6',
          position: data.position || 'right',
          logoUrl: data.logoUrl
        };
        updateWidgetColor();
      }
      initWidget();
    })
    .catch(err => {
      console.error('AgentiLab Widget: Failed to load config', err);
      initWidget();
    });
  
  function updateWidgetColor() {
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
  }
  
  function initWidget() {
    // Create widget HTML
    const container = document.createElement('div');
    container.className = `agentilab-widget-container position-${config.position}`;
    container.innerHTML = `
      <div class="agentilab-widget-chat">
        <div class="agentilab-widget-header" style="background: ${config.primaryColor};">
          ${config.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" class="agentilab-widget-logo">` : ''}
          <div class="agentilab-widget-title">
            <h3>${config.name}</h3>
            <p>Online</p>
          </div>
          <button class="agentilab-widget-close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="agentilab-widget-messages"></div>
        <div class="agentilab-widget-input-container">
          <input type="text" class="agentilab-widget-input" placeholder="Type your message..." />
          <button class="agentilab-widget-send">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <button class="agentilab-widget-button" style="background: ${config.primaryColor};">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    
    document.body.appendChild(container);
    
    // Get elements
    const button = container.querySelector('.agentilab-widget-button');
    const chat = container.querySelector('.agentilab-widget-chat');
    const closeBtn = container.querySelector('.agentilab-widget-close');
    const input = container.querySelector('.agentilab-widget-input');
    const sendBtn = container.querySelector('.agentilab-widget-send');
    const messagesContainer = container.querySelector('.agentilab-widget-messages');
    
    // Toggle chat
    button.addEventListener('click', () => {
      chat.classList.toggle('active');
      if (chat.classList.contains('active')) {
        input.focus();
      }
    });
    
    closeBtn.addEventListener('click', () => {
      chat.classList.remove('active');
    });
    
    // Send message
    function sendMessage() {
      const message = input.value.trim();
      if (!message) return;
      
      // Add user message
      addMessage('user', message);
      input.value = '';
      sendBtn.disabled = true;
      
      // Show typing indicator
      const typing = addTypingIndicator();
      
      // Send to API
      fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId })
      })
      .then(async res => {
        typing.remove();
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = addMessage('assistant', '');
        let fullText = '';
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const json = JSON.parse(data);
                if (json.content) {
                  fullText += json.content;
                  updateMessage(assistantMessage, fullText);
                }
              } catch (e) {}
            }
          }
        }
        
        sendBtn.disabled = false;
      })
      .catch(err => {
        typing.remove();
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        sendBtn.disabled = false;
        console.error('Chat error:', err);
      });
    }
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    
    // Helper functions
    function addMessage(role, content) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `agentilab-widget-message ${role}`;
      messageDiv.innerHTML = `<div class="agentilab-widget-message-content">${escapeHtml(content)}</div>`;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return messageDiv.querySelector('.agentilab-widget-message-content');
    }
    
    function updateMessage(element, content) {
      element.textContent = content;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function addTypingIndicator() {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'agentilab-widget-message assistant';
      messageDiv.innerHTML = '<div class="agentilab-widget-typing"><span></span><span></span><span></span></div>';
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return messageDiv;
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }
})();
