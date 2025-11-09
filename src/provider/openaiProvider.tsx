import OpenAI from 'openai';

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function getEnvVariable(viteKey: string, craKey: string, defaultValue?: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[viteKey as keyof ImportMetaEnv];
    if (value) return value;
  }

  if (typeof process !== 'undefined' && process?.env) {
    const value = process.env[craKey as keyof NodeJS.ProcessEnv];
    if (value) return value;
  }

  return defaultValue;
}

export function createOpenAIProvider() {
  const apiKey = getEnvVariable('VITE_OPENAI_API_KEY', 'REACT_APP_OPENAI_API_KEY');
  const model = getEnvVariable('VITE_OPENAI_MODEL', 'REACT_APP_OPENAI_MODEL', 'gpt-4o-mini') || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error(
      'OpenAI API Key não configurada. Adicione VITE_OPENAI_API_KEY ou REACT_APP_OPENAI_API_KEY no arquivo .env'
    );
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const messages: OpenAIMessage[] = [];

  async function init(initialPrompts: string): Promise<boolean> {
    messages.length = 0;

    if (initialPrompts) {
      messages.push({
        role: 'system',
        content: initialPrompts,
      });
    }

    return true;
  }

  async function prompt(
    text: string,
    signal?: AbortSignal
  ): Promise<ReadableStream<string>> {
    try {
      messages.push({ role: 'user', content: text });

      const stream = await openai.chat.completions.create(
        {
          model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        },
        { signal }
      );

      let assistantMessage = '';

      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (signal?.aborted) {
                controller.close();
                return;
              }

              const content = chunk.choices[0]?.delta?.content || '';

              if (content) {
                assistantMessage += content;
                controller.enqueue(content);
              }

              if (chunk.choices[0]?.finish_reason === 'stop') {
                messages.push({
                  role: 'assistant',
                  content: assistantMessage,
                });
                controller.close();
                return;
              }
            }

            if (assistantMessage) {
              messages.push({
                role: 'assistant',
                content: assistantMessage,
              });
            }

            controller.close();
          } catch (error) {
            if (signal?.aborted) {
              controller.close();
              return;
            }

            console.error('Erro no stream da OpenAI:', error);
            controller.error(error);
          }
        },
      });
    } catch (error) {
      if (signal?.aborted) {
        throw new Error('Request aborted by user');
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request aborted by user');
        }

        if (error.message.includes('quota')) {
          throw new Error(
            'Cota de uso da OpenAI foi excedida. Verifique seu plano ou aguarde.'
          );
        }

        if (error.message.includes('rate')) {
          throw new Error(
            'Muitas requisições. Aguarde um momento antes de tentar novamente.'
          );
        }

        if (error.message.includes('api_key')) {
          throw new Error(
            'Chave de API inválida. Verifique sua OPENAI_API_KEY.'
          );
        }

        throw error;
      }

      throw new Error('Erro desconhecido ao processar mensagem com OpenAI.');
    }
  }

  return { init, prompt };
}
