import { TestBed } from '@angular/core/testing';
import 'jasmine';
import { AccountSaveService } from './account-save.service';

describe('AccountSaveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountSaveService = TestBed.inject(AccountSaveService);
    expect(service).toBeTruthy();
  });
});
