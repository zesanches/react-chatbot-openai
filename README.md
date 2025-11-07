# React Chatbot OpenAI

Componente de chatbot React com integração OpenAI para uso com [react-chatbot-cli](https://github.com/your-username/react-chatbot-cli).

## 📦 Instalação via CLI

```bash
npx react-chatbot-cli init
npx react-chatbot-cli add openai
```

## 🚀 Uso Rápido

```tsx
import { Chatbot } from './components/Chatbot/Chatbot';

function App() {
  return (
    <Chatbot
      apiKey={process.env.REACT_APP_OPENAI_API_KEY}
      config={{
        chatbotName: "Assistente IA",
        model: "gpt-4o-mini",
        showClearButton: true,
      }}
    />
  );
}
```

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do seu projeto:

```env
# Para Vite
VITE_OPENAI_API_KEY=sk-your-api-key-here
VITE_OPENAI_MODEL=gpt-4o-mini

# Para Create React App
REACT_APP_OPENAI_API_KEY=sk-your-api-key-here
REACT_APP_OPENAI_MODEL=gpt-4o-mini
```

## 📝 Props

### `Chatbot`

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `apiKey` | `string` | - | Chave de API da OpenAI (opcional se definida no .env) |
| `avatar` | `string` | Logo OpenAI | URL da imagem do avatar |
| `config` | `ChatbotConfig` | - | Configurações do chatbot |
| `initialPromptsFile` | `string` | `/llms.md` | Arquivo com prompts iniciais |

### `ChatbotConfig`

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|--------|-----------|
| `chatbotName` | `string` | "Assistente IA" | Nome exibido no header |
| `welcomeBubble` | `string` | "👋 Olá!..." | Mensagem de boas-vindas |
| `firstBotMessage` | `string` | "Olá! Sou..." | Primeira mensagem do bot |
| `model` | `string` | "gpt-4o-mini" | Modelo da OpenAI a usar |
| `primaryColor` | `string` | "#10a37f" | Cor principal |
| `backgroundColor` | `string` | "#181C24" | Cor de fundo |
| `showClearButton` | `boolean` | `false` | Mostrar botão de limpar chat |
| `limit` | `number` | `10` | Limite de mensagens |

## 🎨 Customização

### Cores

```tsx
<Chatbot
  config={{
    primaryColor: "#0066cc",
    backgroundColor: "#1a1a1a",
    headerColor: "#2d2d2d",
    botBubble: "#f0f0f0",
    userBubble: "#0066cc",
  }}
/>
```

### Avatar Personalizado

```tsx
<Chatbot
  avatar="https://your-domain.com/avatar.png"
/>
```

### Modelo OpenAI

```tsx
<Chatbot
  config={{
    model: "gpt-4-turbo-preview", // ou gpt-4, gpt-3.5-turbo, etc.
  }}
/>
```

## 📄 Arquivo de Prompts Iniciais

Crie um arquivo `public/llms.md` com instruções para o modelo:

```markdown
# Assistente Virtual

Você é um assistente virtual especializado em...

## Regras
- Seja educado e prestativo
- Responda em português brasileiro
- Use formatação markdown quando apropriado

## Conhecimento
- Você tem conhecimento sobre...
```

## 🔧 Funcionalidades

- ✅ Streaming de respostas em tempo real
- ✅ Histórico de mensagens salvo no localStorage
- ✅ Suporte a Markdown nas respostas
- ✅ Indicador de digitação
- ✅ Tratamento de erros com mensagens amigáveis
- ✅ Cancelamento de requisições
- ✅ Limite de mensagens configurável
- ✅ Responsivo e acessível
- ✅ Tema customizável

## 🎯 Exemplos de Uso

### Chat Básico

```tsx
<Chatbot
  config={{
    chatbotName: "Suporte IA",
    firstBotMessage: "Olá! Como posso te ajudar hoje?",
  }}
/>
```

### Com Botão de Limpar

```tsx
<Chatbot
  config={{
    showClearButton: true,
    handleClearChat: () => {
      console.log("Chat limpo!");
    },
  }}
/>
```

### Com Limite de Mensagens

```tsx
<Chatbot
  config={{
    limit: 20,
  }}
/>
```

## 🚨 Tratamento de Erros

O componente trata automaticamente:
- Chave de API inválida
- Quota excedida
- Rate limiting
- Erros de rede
- Timeout

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
src/
├── components/
│   └── Chatbot/
│       ├── Chatbot.tsx      # Componente principal
│       ├── Chatbot.css      # Estilos
│       └── index.ts         # Exportações
├── hooks/
│   └── useChatbot.ts        # Hook de gerenciamento
└── providers/
    └── openaiProvider.ts    # Provider OpenAI
```

### Modificar o Componente

Após instalar via CLI, você pode modificar os arquivos em `src/components/Chatbot/` livremente:

```tsx
// src/components/Chatbot/Chatbot.tsx
// Modifique como quiser!
```

## 📚 Modelos Disponíveis

- `gpt-4o` - Mais recente e poderoso
- `gpt-4o-mini` - Rápido e econômico (padrão)
- `gpt-4-turbo` - Rápido e avançado
- `gpt-4` - Modelo completo
- `gpt-3.5-turbo` - Rápido e barato

## 💰 Custos

Este componente usa a API da OpenAI, que é paga por uso:
- Custos variam por modelo
- Consulte [preços da OpenAI](https://openai.com/pricing)
- Use `gpt-4o-mini` para desenvolvimento (mais barato)

## 🔒 Segurança

⚠️ **IMPORTANTE**: Nunca exponha sua chave de API em código público!

### Boas Práticas

1. Use variáveis de ambiente (`.env`)
2. Adicione `.env` ao `.gitignore`
3. Use backend proxy para produção (recomendado)
4. Monitore uso na [dashboard OpenAI](https://platform.openai.com/usage)

### Setup Backend (Recomendado para Produção)

```tsx
// Ao invés de passar apiKey direto, faça requisições via seu backend
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message }),
});
```

## 📖 Recursos Adicionais

- [Documentação OpenAI](https://platform.openai.com/docs)
- [React Chatbot CLI](https://github.com/your-username/react-chatbot-cli)
- [Exemplos](https://github.com/your-username/react-chatbot-openai/examples)

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra issues e pull requests.

## 📄 Licença

MIT © [Your Name]

## ⭐ Suporte

Se este projeto te ajudou, considere dar uma estrela no GitHub!
