import { Body, Controller, Post } from '@nestjs/common';
import { FilesService } from './files.service.js';

@Controller('files')
export class FilesController {
  constructor(private svc: FilesService) {}
  @Post('presign')
  presign(@Body() body: { key: string; contentType: string }) {
    return this.svc.presign(body.key, body.contentType);
  }
}
