import { useEffect, useState, useRef } from "react";
import { useChatbot } from "../../hooks/useChatbot";
import Markdown from "react-markdown";

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
      className="w-4 h-4 shrink-0"
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
    <div className="relative">
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

        .message-bubble p {
          margin: 0;
        }

        .message-bubble p+p {
          margin-top: 0.5rem;
        }

        .message-bubble code {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.8125rem;
        }

        .message-bubble pre {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 0.5rem 0;
        }

        .message-bubble pre code {
          background: none;
          padding: 0;
        }

        .message-bubble ul,
        .message-bubble ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .message-bubble li {
          margin: 0.25rem 0;
        }

        .chat-messages {
          scrollbar-width: thin;
        }

        .chat-messages::-webkit-scrollbar {
          width: 8px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
      `}</style>

      <button
        onClick={handleOpen}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full border-0 cursor-pointer flex items-center justify-center p-0 transition-all duration-300 ease-in-out z-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:scale-105 hover:shadow-[0_6px_25px_rgba(0,0,0,0.2)]"
        style={{
          backgroundColor: config.primaryColor,
        }}
        aria-label="Abrir chat"
      >
        <div className="relative">
          <img src={avatar} alt="Chatbot" className="w-12 h-12 rounded-full object-cover" />
          {showWelcome && (
            <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              1
            </span>
          )}
        </div>
      </button>

      {showWelcome && !isOpen && (
        <div
          className="welcome-bubble fixed bottom-20 right-24 max-w-[20rem] p-4 rounded-2xl rounded-bl-2 cursor-pointer transition-all duration-200 z-50 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
          style={{
            backgroundColor: config.botBubble,
            color: config.botText,
            borderBottomLeftRadius: '0.5rem',
          }}
          onClick={handleOpen}
        >
          <div className="text-sm leading-6">{config.welcomeBubble}</div>
        </div>
      )}

      {isOpen && (
        <div
          className="chat-window fixed bottom-24 right-8 w-80 h-96 rounded-lg flex flex-col overflow-hidden z-50 shadow-[0_10px_40px_rgba(0,0,0,0.2)] max-w-[90vw] max-h-[80vh]"
          style={{
            backgroundColor: config.backgroundColor,
          }}
        >
          <div
            className="py-3 px-4 flex items-center gap-3 text-white font-medium border-b border-white/10"
            style={{
              backgroundColor: config.headerColor,
            }}
          >
            <img src={avatar} alt="Bot" className="w-8 h-8 rounded-full object-cover" />
            <span className="flex-1 text-lg">{config.chatbotName}</span>

            {config.showClearButton && messages.length > 0 && (
              <button
                onClick={handleClear}
                className="text-gray-400 bg-transparent border-0 cursor-pointer transition-all duration-200 p-1 rounded flex items-center justify-center hover:text-white hover:bg-white/10"
                aria-label="Limpar chat"
                title="Limpar conversa"
              >
                <svg
                  className="w-4 h-4"
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
              className="text-gray-400 bg-transparent border-0 cursor-pointer text-2xl font-bold leading-none transition-colors duration-200 hover:text-white"
              aria-label="Fechar chat"
            >
              ×
            </button>
          </div>

          <div
            className="chat-messages flex-1 p-3 overflow-y-auto flex flex-col gap-3"
            style={{ backgroundColor: config.backgroundColor }}
          >
            {firstMessageShown &&
              config.firstBotMessage &&
              messages.length === 0 && (
                <div className="flex gap-3 items-start">
                  <img
                    src={avatar}
                    alt="Bot"
                    className="w-8 h-8 rounded-full shrink-0 object-cover"
                  />
                  <div
                    className="message-bubble max-w-[75%] p-3 rounded-2xl text-sm leading-6 rounded-bl-[0.375rem]"
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
                  <div className="flex gap-3 justify-end">
                    <div
                      className="message-bubble max-w-[75%] p-3 rounded-2xl text-sm leading-6 rounded-br-[0.375rem]"
                      style={{
                        backgroundColor: config.userBubble,
                        color: config.userText,
                      }}
                    >
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                ) : message.role === "assistant" ? (
                  <div className="flex gap-3 items-start">
                    <img
                      src={avatar}
                      alt="Bot"
                      className="w-8 h-8 rounded-full shrink-0 object-cover"
                    />
                    <div
                      className="message-bubble max-w-[75%] p-3 rounded-2xl text-sm leading-6 rounded-bl-[0.375rem]"
                      style={{
                        backgroundColor: config.botBubble,
                        color: config.botText,
                      }}
                    >
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                ) : message.role === "error" ? (
                  <div className="flex gap-3 items-start">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: config.errorText,
                      }}
                    >
                      <ErrorIcon />
                    </div>
                    <div
                      className="error-message message-bubble max-w-[75%] p-3 rounded-2xl text-sm leading-6 border-l-4 rounded-bl-[0.375rem]"
                      style={{
                        backgroundColor: config.errorBubble,
                        color: config.errorText,
                        borderLeftColor: config.errorText,
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1">
                          <ErrorIcon />
                          <div className="font-semibold">Erro</div>
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
            className="flex gap-2 p-3 border-t border-white/10"
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
              className="flex-1 py-2 px-3 rounded-lg border-0 text-sm outline-none transition-all duration-200 text-white disabled:opacity-50"
              style={{
                backgroundColor: config.backgroundColor,
              }}
            />
            <button
              onClick={loading ? abortChatMessage : handleSend}
              className="py-2 px-4 rounded-lg border-0 text-white text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
