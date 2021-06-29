export interface QuotedMessage {
  id: string;
  body: QuotedMessage.Body
  type: string;
  from: QuotedMessage.From
  chatId: string;
  content: QuotedMessage.Content
}

namespace QuotedMessage {
  export type Body = string;
  export type Content = string;
  export type From = string;
}
