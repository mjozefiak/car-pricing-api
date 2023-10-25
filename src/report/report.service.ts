import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from '../user/user.entity';
import { GetEstimateDto } from './dto/get-estimate.dto';

@Injectable()
export class ReportService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async changeApproval(id: number, approved: boolean) {
    const report = await this.repo.findOneBy({ id });

    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    report.approved = approved;
    return this.repo.save(report);
  }

  async estimate({
    brand,
    model,
    year,
    latitude,
    longitude,
    course,
  }: GetEstimateDto) {
    return this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('brand = :brand', { brand })
      .andWhere('model = :model', { model })
      .andWhere('longitude - :longitude BETWEEN -5 AND 5', { longitude })
      .andWhere('latitude - :latitude BETWEEN -5 AND 5', { latitude })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved = 1')
      .orderBy('ABS(course - :course)', 'DESC')
      .setParameters({ course })
      .limit(3)
      .getRawOne();
  }
}
