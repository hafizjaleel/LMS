export interface PushPayload {
  title: string;
  body: string;
  link?: string;
  type?: string;
  priority?: "low" | "urgent" |"medium" | "high";
}