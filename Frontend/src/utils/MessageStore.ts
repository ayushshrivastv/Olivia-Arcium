export type UIMessage = {
  id: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
  room: `chat@${string}`;
};

class MessageStore {
  private static instance: MessageStore;
  private messagesByRoom: Record<string, UIMessage[]> = {};

  private constructor() {}

  public static getInstance(): MessageStore {
    if (!this.instance) {
      this.instance = new MessageStore();
    }
    return this.instance;
  }

  public addMessage(room: `chat@${string}`, message: UIMessage): void {
    if (!this.messagesByRoom[room]) {
      this.messagesByRoom[room] = [];
    }

    // Prevent adding duplicate messages if they have the same ID
    // This is important if the server might send a message multiple times or if there's a quick resubscribe.
    const existingMessageIndex = this.messagesByRoom[room].findIndex(
      (m) => m.id === message.id
    );
    if (existingMessageIndex !== -1) {
      // Optionally update if the new message has more recent info, or just skip
      // console.warn(`MessageStore: Duplicate messageId ${message.id} for room ${room}. Updating.`);
      // this.messagesByRoom[room][existingMessageIndex] = message;
      return; // Skip if already exists
    }

    this.messagesByRoom[room].push(message);
    // Optional: Keep the array sorted by timestamp if messages can arrive out of order
    this.messagesByRoom[room].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  public getMessages(room: `chat@${string}`): UIMessage[] {
    return [...(this.messagesByRoom[room] || [])]; // Return a copy
  }

  public clearMessagesForRoom(room: `chat@${string}`): void {
    if (this.messagesByRoom[room]) {
      this.messagesByRoom[room] = [];
    }
  }

  public clearAllMessages(): void {
    this.messagesByRoom = {};
  }
}

export default MessageStore.getInstance();
