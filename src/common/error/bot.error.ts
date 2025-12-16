export class BotError extends Error {
  public readonly statusCode;
  public readonly title;

  constructor(statusCode: number, title: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.title = title;
  }
}
