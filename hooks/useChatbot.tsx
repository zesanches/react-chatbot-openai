import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { createOpenAIProvider } from "../provider/openaiProvider";

type Message = {
  role: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp: number;
  error?: boolean;
};

type ChatbotState = {
  messages: Message[];
  loading: boolean;
  sendMessage: (message: string) => void;
  init: () => Promise<void>;
  clearChat: () => void;
  abortChatMessage: () => void;
};

const storage = {
  getMessages(): Message[] {
    try {
      return JSON.parse(localStorage.getItem("chatbot_messages_openai") || "[]");
    } catch {
      return [];
    }
  },

  saveMessages(messages: Message[]) {
    localStorage.setItem("chatbot_messages_openai", JSON.stringify(messages));
  },

  clearMessages() {
    localStorage.removeItem("chatbot_messages_openai");
  },
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("api key") || message.includes("api_key")) {
      return "Chave de API da OpenAI inválida. Verifique sua OPENAI_API_KEY no arquivo .env";
    }

    if (message.includes("quota") || message.includes("insufficient_quota")) {
      return "Cota de uso da OpenAI foi excedida. Verifique seu plano ou adicione créditos.";
    }

    if (message.includes("rate")) {
      return "Muitas requisições. Aguarde um momento antes de tentar novamente.";
    }

    if (message.includes("failed to fetch") || message.includes("network")) {
      return "Erro de conexão. Verifique sua internet e tente novamente.";
    }

    if (message.includes("limite de mensagens atingido")) {
      return "Você atingiu o limite de mensagens desta conversa. Limpe o chat para continuar.";
    }

    if (message.includes("request aborted") || message.includes("aborted")) {
      return "Mensagem cancelada pelo usuário.";
    }

    if (message.includes("timeout")) {
      return "A requisição demorou muito para responder. Tente novamente.";
    }

    if (message.includes("model") && message.includes("does not exist")) {
      return "Modelo especificado não existe ou você não tem acesso a ele.";
    }

    return error.message;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}

export function useChatbot({
  provider = "openai",
  apiKey,
  config = { limit: 10 },
  initialPromptsFile = "/llms.md",
}: {
  provider?: "openai";
  apiKey?: string;
  config?: {
    limit: number;
    model?: string;
  };
  initialPromptsFile?: string;
}): ChatbotState {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const abortController = useRef(new AbortController());

  const chatProvider = useMemo(() => {
    if (apiKey) {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        (import.meta.env as any).VITE_OPENAI_API_KEY = apiKey;
      } else if (typeof process !== 'undefined' && process?.env) {
        (process.env as any).REACT_APP_OPENAI_API_KEY = apiKey;
      }
    }
    return createOpenAIProvider();
  }, [apiKey]);

  useEffect(() => {
    const savedMessages = storage.getMessages();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  const saveMessages = useCallback((newMessages: Message[]) => {
    const messagesWithoutSystem = newMessages.filter(
      (m) => m.role !== "system",
    );
    storage.saveMessages(messagesWithoutSystem);
  }, []);

  const addErrorMessage = useCallback(
    (error: unknown) => {
      const errorMessage: Message = {
        role: "error",
        content: getErrorMessage(error),
        timestamp: Date.now(),
        error: true,
      };

      setMessages((prev) => {
        const updated = [...prev, errorMessage];
        saveMessages(updated);
        return updated;
      });
    },
    [saveMessages],
  );

  const init = useCallback(async () => {
    let initialPrompts = "";

    try {
      const res = await fetch(initialPromptsFile);

      if (res.ok) {
        initialPrompts = await res.text();
      }
    } catch (e: unknown) {
      console.warn("Arquivo de prompts não encontrado, usando systemPrompt padrão", e);
    }

    try {
      await chatProvider.init(initialPrompts);
    } catch (error) {
      console.error("Erro ao inicializar chatbot:", error);
      addErrorMessage(error);
    }
  }, [chatProvider, initialPromptsFile, addErrorMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    storage.clearMessages();
  }, []);

  const abortChatMessage = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort("Request aborted by user");

      abortController.current = new AbortController();

      const cancelMessage: Message = {
        role: "error",
        content: "Mensagem cancelada. Você pode enviar uma nova mensagem.",
        timestamp: Date.now(),
        error: true,
      };

      setMessages((prev) => {
        const updated = [...prev, cancelMessage];
        saveMessages(updated);
        return updated;
      });
    }
  }, [saveMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (messages.length > config.limit) {
        addErrorMessage(new Error("Limite de mensagens atingido"));
        return;
      }

      setLoading(true);

      abortController.current = new AbortController();

      const userMessage: Message = {
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      try {
        const stream = await chatProvider.prompt(
          text,
          abortController.current.signal,
        );

        const botMessage: Message = {
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        const messagesWithBot = [...updatedMessages, botMessage];
        setMessages(messagesWithBot);

        const reader = (stream as ReadableStream<string>).getReader();
        const decoder = new TextDecoder();
        let hasContent = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk =
            typeof value === "string" ? value : decoder.decode(value);

          if (chunk.trim()) {
            hasContent = true;
          }

          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];

            if (last.role === "assistant") {
              last.content += chunk;
            }

            setTimeout(() => saveMessages(updated), 0);

            return [...updated];
          });
        }

        if (!hasContent) {
          throw new Error("Nenhuma resposta foi gerada pelo modelo");
        }
      } catch (err) {
        console.error("Erro ao enviar mensagem:", err);

        if (err instanceof Error && err.message.includes("aborted")) {
          setMessages((prev) => {
            const updated = [...prev];
            if (
              updated[updated.length - 1]?.role === "assistant" &&
              !updated[updated.length - 1]?.content.trim()
            ) {
              updated.pop();
            }
            saveMessages(updated);
            return updated;
          });
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            if (
              updated[updated.length - 1]?.role === "assistant" &&
              !updated[updated.length - 1]?.content.trim()
            ) {
              updated.pop();
            }
            return updated;
          });

          addErrorMessage(err);
        }

        saveMessages(updatedMessages);
      } finally {
        setLoading(false);
      }
    },
    [chatProvider, messages, saveMessages, config.limit, addErrorMessage],
  );

  return {
    init,
    messages,
    loading,
    sendMessage,
    clearChat,
    abortChatMessage,
  };
}
