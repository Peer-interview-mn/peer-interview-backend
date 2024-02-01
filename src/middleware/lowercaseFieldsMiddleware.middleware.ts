// lowercase-fields.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LowercaseFieldsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.convertToLowerCase(req.body, ['email', 'userName']);
    }
    if (req.params) {
      req.params = this.convertToLowerCase(req.params, ['userName', 'email']);
    }
    next();
  }

  private convertToLowerCase(obj: any, fieldsToConvert: string[]): any {
    if (obj instanceof Array) {
      return obj.map((item) => this.convertToLowerCase(item, fieldsToConvert));
    } else if (obj instanceof Object) {
      return Object.keys(obj).reduce((result, key) => {
        const newKey = fieldsToConvert.includes(key) ? key.toLowerCase() : key;
        result[newKey] = this.convertToLowerCase(obj[key], fieldsToConvert);
        return result;
      }, {});
    }
    return obj;
  }
}
