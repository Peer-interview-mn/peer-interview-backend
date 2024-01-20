import {
  HttpException,
  HttpStatus,
  Injectable,
  UploadedFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  constructor(private readonly configService: ConfigService) {}
  bucket = this.configService.get('aws.s3.bucket');
  s3 = new S3({
    region: this.configService.get('aws.s3.region'),
    accessKeyId: this.configService.get('aws.s3.access_key'),
    secretAccessKey: this.configService.get('aws.s3.secret_access_key'),
  });

  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}-${file.originalname}`;

    const params = {
      Bucket: this.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const data = await this.s3.upload(params).promise();

      const s3Url = data.Location;

      return { fileUrl: s3Url };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

// import {
//   HttpException,
//   HttpStatus,
//   Injectable,
//   UploadedFile,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { v4 as uuidv4 } from 'uuid';
//
// @Injectable()
// export class FileUploadService {
//   constructor(private readonly configService: ConfigService) {}
//
//   bucket = this.configService.get('aws.s3.bucket');
//   s3 = new S3Client({
//     region: this.configService.get('aws.s3.region'),
//     credentials: {
//       accessKeyId: this.configService.get('aws.s3.access_key'),
//       secretAccessKey: this.configService.get('aws.s3.secret_access_key'),
//     },
//   });
//
//   async uploadFile(@UploadedFile() file: Express.Multer.File) {
//     const uniqueId = uuidv4();
//     const fileName = `${uniqueId}-${file.originalname}`;
//
//     const params = {
//       Bucket: this.bucket,
//       Key: fileName,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     };
//
//     const uploadCommand = new PutObjectCommand(params);
//
//     try {
//       const data = await this.s3.send(uploadCommand);
//
//       const s3Url = `https://${this.bucket}.s3.${this.configService.get(
//         'aws.s3.region',
//       )}.amazonaws.com/${fileName}`;
//
//       return { fileUrl: s3Url };
//     } catch (error) {
//       throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//     }
//   }
// }
