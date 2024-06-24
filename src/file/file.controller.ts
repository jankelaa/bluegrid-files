import { Controller, Get } from '@nestjs/common';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Get()
    async getFiles() {
        return this.fileService.getFilesData();
    }
}
