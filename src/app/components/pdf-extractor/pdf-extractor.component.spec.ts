import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfExtractorComponent } from './pdf-extractor.component';

describe('PdfExtractorComponent', () => {
  let component: PdfExtractorComponent;
  let fixture: ComponentFixture<PdfExtractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfExtractorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfExtractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
