import { TestBed } from '@angular/core/testing';

import { SessionMonitorService } from './session-monitor.service';

describe('SessionMonitorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SessionMonitorService = TestBed.inject(SessionMonitorService);
    expect(service).toBeTruthy();
  });
});
