import { Test, TestingModule } from '@nestjs/testing';
import { StorageR2Service } from './storage-r2.service';

describe('StorageR2Service', () => {
  let service: StorageR2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageR2Service],
    }).compile();

    service = module.get<StorageR2Service>(StorageR2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
