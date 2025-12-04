import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Загрузить файл' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Файл не найден', HttpStatus.BAD_REQUEST);
    }

    const upload = await this.uploadService.saveFile(file);
    return upload;
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Получить файл' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = await this.uploadService.getFile(filename);

    if (!filepath) {
      throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
    }

    return res.sendFile(filepath);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить файл' })
  async deleteFile(@Param('id') id: string) {
    const deleted = await this.uploadService.deleteFile(id);

    if (!deleted) {
      throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
    }

    return { message: 'Файл успешно удален' };
  }
}
