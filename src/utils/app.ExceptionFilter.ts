import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpStatusMessage } from './httpStatusMessage.enum';

@Catch(HttpException)
export class AppExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse:any = exception.getResponse();
        

        response
            .status(exceptionResponse.statusCode || exception.getStatus())
            .json({
                status: exceptionResponse.status || HttpStatusMessage.ERROR,
                message: exceptionResponse.message || exceptionResponse
            });
    }
}