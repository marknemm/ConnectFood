import { TestBed } from '@angular/core/testing';

import { AdminDonationSaveService } from './admin-donation-save.service';

describe('AdminDonationSaveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdminDonationSaveService = TestBed.inject(AdminDonationSaveService);
    expect(service).toBeTruthy();
  });
});
