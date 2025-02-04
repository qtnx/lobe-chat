/* eslint-disable sort-keys-fix/sort-keys-fix */
import { ChatStreamPayload, ModelProvider, OpenAIChatMessage } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

// TODO: 临时写法，后续要重构成 model card 展示配置
export const o1Models = new Set([
  'o1',
  'o1-mini',
  'o1-preview',
  'o1-preview-2024-09-12',
  'o1-mini',
  'o1-mini-2024-09-12',
  'o1',
  'o1-2024-12-17',
]);

export const pruneO1Payload = (payload: ChatStreamPayload) => ({
  ...payload,
  frequency_penalty: 0,
  messages: payload.messages.map((message: OpenAIChatMessage) => ({
    ...message,
    role: message.role === 'system' ? ( (payload.model === 'o1' || payload.model === 'o1-mini') ? 'developer' : 'user') : message.role,
  })),
  stream: payload.model === "o1" ? false : payload.stream,
  presence_penalty: 0,
  temperature: 1,
  top_p: 1
});

export const LobeOpenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (o1Models.has(model)) {
        return pruneO1Payload(payload) as any;
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.OpenAI,
});
