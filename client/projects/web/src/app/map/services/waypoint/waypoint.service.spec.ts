import { TestBed } from '@angular/core/testing';

import { WaypointService } from './waypoint.service';

describe('WaypointService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WaypointService = TestBed.inject(WaypointService);
    expect(service).toBeTruthy();
  });
});
