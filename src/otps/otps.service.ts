import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from '@/otps/entities/otp.entity';
import { Model, Types } from 'mongoose';
import { OtpCodeType } from '@/otps/enums/index.enum';
import {
  generatePasswordChangeCode,
  generateVerifyCode,
} from '@/common/verifyCode';

const { ObjectId } = Types;

@Injectable()
export class OtpsService {
  constructor(
    @InjectModel(Otp.name)
    private readonly optModel: Model<Otp>,
  ) {}

  async findActiveOtp(userId: string, type: OtpCodeType) {
    const activeDate = new Date(Date.now() + 6 * 60 * 1000);
    return await this.optModel.findOne({
      userId: new ObjectId(userId),
      type: type,
      code_expire: { $gt: activeDate },
    });
  }

  async createCode(userId: string, type: OtpCodeType) {
    try {
      const foundOtp = await this.optModel.findOne({
        userId: new ObjectId(userId),
        type: type,
      });

      const generateCodeFn =
        type === OtpCodeType.VERIFYACCOUNT
          ? generateVerifyCode
          : generatePasswordChangeCode;
      const { code, expireDate } = generateCodeFn();

      if (foundOtp) {
        const activeOtp = await this.findActiveOtp(userId, type);
        if (activeOtp) return activeOtp;

        foundOtp.code = code;
        foundOtp.code_expire = expireDate;
        await foundOtp.save();
        return foundOtp;
      }
      // new opt
      const otp = new this.optModel({
        userId: userId,
        code: code,
        type: type,
        code_expire: expireDate,
      });

      await otp.save();
      return otp;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async checkVerifyCode(userId: string, clientCode: string, type: OtpCodeType) {
    try {
      const checkOtp = await this.optModel.findOne({
        userId: new ObjectId(userId),
        code: clientCode,
        type: type,
        code_expire: { $gt: Date.now() },
      });

      if (!checkOtp) {
        throw new HttpException(
          `Invalid or expired code`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return checkOtp;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyCode(userId: string, clientCode: string, type: OtpCodeType) {
    try {
      const checkOtp = await this.checkVerifyCode(userId, clientCode, type);

      checkOtp.code = null;
      checkOtp.code_expire = null;

      await checkOtp.save();
      return checkOtp;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
