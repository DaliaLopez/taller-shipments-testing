import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShipmentEntity } from './entities/shipment.entity';
import { ShipmentRulesService } from './shipment-rules.service';
import { ShipmentStatus } from './shipment-status.enum';
import { ShipmentsService } from './shipments.service';
import { describe } from 'node:test';
import { beforeEach, expect, it, jest } from '@jest/globals';

describe('ShipmentsService', () => {
    let service: ShipmentsService;
    let repository: jest.Mocked<Repository<ShipmentEntity>>;
    let rulesService: jest.Mocked<ShipmentRulesService>;

    const mockRepository = {
        find: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockShipmentRulesService = {
        ensureCanBeDispatched: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShipmentsService,
                {
                    provide: getRepositoryToken(ShipmentEntity),
                    useValue: mockRepository,
                },
                {
                    provide: ShipmentRulesService,
                    useValue: mockShipmentRulesService,
                },
            ],
        }).compile();

        service = module.get(ShipmentsService);
        repository = module.get(getRepositoryToken(ShipmentEntity));
        rulesService = module.get(ShipmentRulesService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    
});