import api from './api';
import type { ChatMessage } from '../types';

export const aiService = {
  async sendMessage(message: string, conversationHistory: ChatMessage[]): Promise<string> {
    const { data } = await api.post<{ reply: string }>('/ai/chat', {
      message,
      conversationHistory,
    });
    return data.reply;
  },
};
