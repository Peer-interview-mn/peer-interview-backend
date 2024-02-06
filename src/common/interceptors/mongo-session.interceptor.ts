import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { from, Observable } from 'rxjs';
import { catchError, mapTo, switchMap, tap } from 'rxjs/operators';

export class MongoSessionInterceptor implements NestInterceptor {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();

    const session = await this.connection.startSession();
    session.startTransaction();
    req.session = session;

    return next.handle().pipe(
      switchMap((data) =>
        from(
          session.inTransaction()
            ? session.commitTransaction()
            : Promise.resolve(),
        ).pipe(mapTo(data)),
      ),
      tap(() => session.inTransaction() && session.endSession()),
      catchError(async (err) => {
        if (session.inTransaction()) {
          await session.abortTransaction();
          session.endSession();
        }

        throw err;
      }),
    );
  }
}
