import { Module } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { FilesController } from './files.controller.js';

@Module({ providers: [FilesService], controllers: [FilesController] })
export class FilesModule {}
