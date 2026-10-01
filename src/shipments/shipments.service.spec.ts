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


    it('returns all shipments', async () => {
        const mockShipments: ShipmentEntity[] = [
            { id: 1, trackingCode: 'SHIP-101', destination: 'Cali', status: ShipmentStatus.CREATED },
            { id: 2, trackingCode: 'SHIP-102', destination: 'Bogotá', status: ShipmentStatus.DISPATCHED },
        ];
        repository.find.mockResolvedValue(mockShipments);

        const result = await service.findAll();

        expect(result).toEqual(mockShipments);
        expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('returns a shipment when the id exists', async () => {
        const mockShipment: ShipmentEntity = {
            id: 7,
            trackingCode: 'SHIP-007',
            destination: 'Medellín',
            status: ShipmentStatus.CREATED,
        };
        repository.findOneBy.mockResolvedValue(mockShipment);

        const result = await service.findOne(7);

        expect(result).toEqual(mockShipment);
        expect(repository.findOneBy).toHaveBeenCalledWith({ id: 7 });
    });


    it('throws NotFoundException when the id does not exist', async () => {
        repository.findOneBy.mockResolvedValue(null);

        await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });


    it('creates and saves a shipment', async () => {
        const createDto: CreateShipmentDto = {
            trackingCode: 'SHIP-100',
            destination: 'Cali',
        };

        const createdEntity: ShipmentEntity = {
            id: 1,
            ...createDto,
            status: ShipmentStatus.CREATED,
        };

        repository.create.mockReturnValue(createdEntity);
        repository.save.mockResolvedValue(createdEntity);

        const result = await service.create(createDto);

        expect(repository.create).toHaveBeenCalledWith({
            ...createDto,
            status: ShipmentStatus.CREATED,
        });
        expect(repository.save).toHaveBeenCalledWith(createdEntity);
        expect(result).toEqual(createdEntity);
    });


    it('dispatches and saves a valid shipment', async () => {
        const initialShipment: ShipmentEntity = {
            id: 1,
            trackingCode: 'SHIP-100',
            destination: 'Cali',
            status: ShipmentStatus.CREATED,
        };

        const dispatchedShipment: ShipmentEntity = {
            ...initialShipment,
            status: ShipmentStatus.DISPATCHED,
        };

        repository.findOneBy.mockResolvedValue(initialShipment);
        repository.save.mockResolvedValue(dispatchedShipment);

        const result = await service.dispatch(1);

        expect(rulesService.ensureCanBeDispatched).toHaveBeenCalledWith(initialShipment);
        expect(initialShipment.status).toBe(ShipmentStatus.DISPATCHED);
        expect(repository.save).toHaveBeenCalledWith(dispatchedShipment);
        expect(result).toEqual(dispatchedShipment);
    });

});