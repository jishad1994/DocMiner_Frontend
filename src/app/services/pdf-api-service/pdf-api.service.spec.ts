import { TestBed } from '@angular/core/testing';

import { PdfApiService } from './pdf-api.service';

describe('PdfApiService', () => {
  let service: PdfApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
