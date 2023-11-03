import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  Patch,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';
import { CurrentUser } from '../decorator/current-user.decorator';
import { User } from '../user/user.entity';
import { Serialize } from '../interceptor/serialize.interceptor';
import { ReportDto } from './dto/report.dto';
import { ApproveReportDto } from './dto/approve-report.dto';
import { AdminGuard } from '../auth/guard/admin.guard';
import { GetEstimateDto } from './dto/get-estimate.dto';
import { AccessAuthGuard } from '../auth/guard/access-auth.guard';

@Controller('reports')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  @UseGuards(AccessAuthGuard)
  @Serialize(ReportDto)
  create(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportService.create(body, user);
  }

  @Get()
  async findAll() {
    return await this.reportService.findAll();
  }

  @Get('estimate')
  async getEstimate(@Query() query: GetEstimateDto) {
    const estimation = await this.reportService.estimate(query);

    if (!estimation.price) {
      throw new HttpException(
        'Not enough data to create this estimation.',
        HttpStatus.ACCEPTED,
      );
    }

    return estimation;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const report = await this.reportService.findOne(parseInt(id));

    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    return report;
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    return await this.reportService.changeApproval(parseInt(id), body.approved);
  }
}
