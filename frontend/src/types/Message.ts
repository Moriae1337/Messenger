import type { Attachment } from "./Attachment.ts";

export interface Message {
  id: number;
  text: string;
  sender_id: number;
  recipient_id: number;
  attachments: Attachment[];
}
