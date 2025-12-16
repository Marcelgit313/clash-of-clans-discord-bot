import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Logger } from "../../logger/logger.js";
import { BotError } from "../bot.error.js";

@Catch(Error)
export class GlobalErrorFilter implements ExceptionFilter {
  private logger = new Logger(GlobalErrorFilter.name);

  public catch(error: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (error instanceof BotError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      response.status(error.statusCode);
      return;
    } else if (error instanceof NotFoundException) {
      this.logger.log("Request: [%s %s] could not be found", request.method, request.url);
      response.status(HttpStatus.NOT_FOUND);
      return;
    }

    this.logger.error(
      "An unexpected error occurred during request: [%s %s]. Request Body: [%s]. Error: [%s]",
      request.method,
      request.url,
      request.body,
      error
    );

    response.status(500);
  }
}