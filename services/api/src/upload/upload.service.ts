import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadPath = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    // Создаем директорию uploads если её нет
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File) {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadPath, filename);

    // Сохраняем файл на диск
    fs.writeFileSync(filepath, file.buffer);

    // Сохраняем информацию в БД
    const upload = await this.prisma.upload.create({
      data: {
        originalName: file.originalname,
        filename: filename,
        mimetype: file.mimetype,
        size: file.size,
        path: filepath,
        url: `/uploads/${filename}`,
      },
    });

    return upload;
  }

  async getFile(filename: string) {
    const filepath = path.join(this.uploadPath, filename);

    if (!fs.existsSync(filepath)) {
      return null;
    }

    return filepath;
  }

  async deleteFile(id: string) {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      return false;
    }

    // Удаляем файл с диска
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path);
    }

    // Удаляем запись из БД
    await this.prisma.upload.delete({
      where: { id },
    });

    return true;
  }
}
