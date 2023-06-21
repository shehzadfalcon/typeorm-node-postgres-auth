import { Response } from 'express';

class LoggerService {
  // logger
  LoggerHandler = (
    status: number,
    message: string = "",
    response: Response,
    data: object = {}
  ): Response => {
    let success = status == 200 || status == 201 ? true : false;

    return response
      .status(status)
      .json({ message: message, status: status, success: success, data });
  };
}

export default new LoggerService();
