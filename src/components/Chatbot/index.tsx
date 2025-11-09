import { useEffect, useState, useRef } from "react";
import { useChatbot } from "../../hooks/useChatbot";
import Markdown from "react-markdown";
import "../styles/chatbot.css"

export type ChatbotProps = {
  apiKey?: string;
  avatar?: string;
  config?: ChatbotConfig;
  initialPromptsFile?: string;
};

export type Message = {
  role: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp: number;
  error?: boolean;
};

export type ChatbotConfig = {
  chatbotName?: string;
  welcomeBubble?: string;
  firstBotMessage?: string;
  primaryColor?: string;
  backgroundColor?: string;
  headerColor?: string;
  botBubble?: string;
  botText?: string;
  userBubble?: string;
  userText?: string;
  buttonColor?: string;
  typingDelay?: number;
  showClearButton?: boolean;
  limit?: number;
  errorBubble?: string;
  errorText?: string;
  model?: string;
  handleClearChat?: () => void;
};

const defaultConfig: ChatbotConfig = {
  chatbotName: "Assistente IA",
  welcomeBubble: "👋 Olá! Como posso ajudar você hoje?",
  firstBotMessage: "Olá! Sou seu assistente virtual. Como posso te ajudar?",
  primaryColor: "#10a37f",
  backgroundColor: "#181C24",
  headerColor: "#1e202c",
  botBubble: "#f6f8fa",
  botText: "#1b5e20",
  userBubble: "#10a37f",
  userText: "#ffffff",
  buttonColor: "#10a37f",
  errorBubble: "#fee2e2",
  errorText: "#991b1b",
  typingDelay: 1200,
  showClearButton: false,
  limit: 10,
  model: "gpt-4o-mini",
  handleClearChat: () => { },
};

export function Chatbot({
  apiKey,
  avatar = "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  config: userConfig,
  initialPromptsFile = "/llms.md",
}: ChatbotProps) {
  const config = { ...defaultConfig, ...userConfig };
  const { messages, loading, sendMessage, init, clearChat, abortChatMessage } =
    useChatbot({
      provider: "openai",
      apiKey,
      config: {
        limit: config.limit || 10,
        model: config.model,
      },
      initialPromptsFile,
    });

  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [firstMessageShown, setFirstMessageShown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    init();
  }, [init]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowWelcome(false);
    setFirstMessageShown(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-1 ml-10 my-2 h-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="typing-dot"
          style={{
            backgroundColor: config.botText,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );

  const handleClear = () => {
    clearChat();
    userConfig?.handleClearChat?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ErrorIcon = () => (
    <svg
      className="error-icon"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="chatbot-wrapper">
      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          opacity: 0.3;
          animation: typing-pulse 1.4s infinite;
        }

        @keyframes typing-pulse {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .chat-window {
          animation: slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .welcome-bubble {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translateX(60px) scale(0.8);
          }
          60% {
            transform: translateX(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .error-message {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>

      <button
        onClick={handleOpen}
        className="chatbot-button"
        style={{
          backgroundColor: config.primaryColor,
        }}
        aria-label="Abrir chat"
      >
        <div className="chatbot-avatar-wrapper">
          <img src={avatar} alt="Chatbot" className="chatbot-avatar" />
          {showWelcome && (
            <span className="chatbot-notification-badge">1</span>
          )}
        </div>
      </button>

      {showWelcome && !isOpen && (
        <div
          className="welcome-bubble"
          style={{
            backgroundColor: config.botBubble,
            color: config.botText,
          }}
          onClick={handleOpen}
        >
          <div className="welcome-text">{config.welcomeBubble}</div>
        </div>
      )}

      {isOpen && (
        <div
          className="chat-window"
          style={{
            backgroundColor: config.backgroundColor,
          }}
        >
          <div
            className="chat-header"
            style={{
              backgroundColor: config.headerColor,
            }}
          >
            <img src={avatar} alt="Bot" className="chat-header-avatar" />
            <span className="chat-header-name">{config.chatbotName}</span>

            {config.showClearButton && messages.length > 0 && (
              <button
                onClick={handleClear}
                className="chat-clear-button"
                aria-label="Limpar chat"
                title="Limpar conversa"
              >
                <svg
                  className="chat-clear-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={handleClose}
              className="chat-close-button"
              aria-label="Fechar chat"
            >
              ×
            </button>
          </div>

          <div
            className="chat-messages"
            style={{ backgroundColor: config.backgroundColor }}
          >
            {firstMessageShown &&
              config.firstBotMessage &&
              messages.length === 0 && (
                <div className="message-wrapper bot-message">
                  <img
                    src={avatar}
                    alt="Bot"
                    className="message-avatar"
                  />
                  <div
                    className="message-bubble bot-bubble"
                    style={{
                      backgroundColor: config.botBubble,
                      color: config.botText,
                    }}
                  >
                    <Markdown>{config.firstBotMessage}</Markdown>
                  </div>
                </div>
              )}

            {messages.map((message: Message, index: number) => (
              <div key={index}>
                {message.role === "user" ? (
                  <div className="message-wrapper user-message">
                    <div
                      className="message-bubble user-bubble"
                      style={{
                        backgroundColor: config.userBubble,
                        color: config.userText,
                      }}
                    >
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                ) : message.role === "assistant" ? (
                  <div className="message-wrapper bot-message">
                    <img
                      src={avatar}
                      alt="Bot"
                      className="message-avatar"
                    />
                    <div
                      className="message-bubble bot-bubble"
                      style={{
                        backgroundColor: config.botBubble,
                        color: config.botText,
                      }}
                    >
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                ) : message.role === "error" ? (
                  <div className="message-wrapper bot-message">
                    <div
                      className="error-icon-wrapper"
                      style={{
                        backgroundColor: config.errorText,
                      }}
                    >
                      <ErrorIcon />
                    </div>
                    <div
                      className="error-message message-bubble"
                      style={{
                        backgroundColor: config.errorBubble,
                        color: config.errorText,
                        borderLeftColor: config.errorText,
                      }}
                    >
                      <div className="error-content">
                        <div className="error-header">
                          <ErrorIcon />
                          <div className="error-title">Erro</div>
                        </div>
                        <div>
                          <Markdown>{message.content}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          <div
            className="chat-input-container"
            style={{
              backgroundColor: config.headerColor,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              className="chat-input"
              style={{
                backgroundColor: config.backgroundColor,
              }}
            />
            <button
              onClick={loading ? abortChatMessage : handleSend}
              className="chat-send-button"
              style={{
                backgroundColor: config.buttonColor,
              }}
            >
              {loading ? "Cancelar" : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
