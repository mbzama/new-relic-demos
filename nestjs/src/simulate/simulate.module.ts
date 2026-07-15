import { Module } from '@nestjs/common';
import { SimulateController } from './simulate.controller';

@Module({ controllers: [SimulateController] })
export class SimulateModule {}
