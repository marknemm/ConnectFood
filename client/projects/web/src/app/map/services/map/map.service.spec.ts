import { TestBed } from '@angular/core/testing';
import { MapService } from './map.service';

describe('MapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapService = TestBed.inject(MapService);
    expect(service).toBeTruthy();
  });
});
