import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageGridComponent } from './page-grid.component';

describe('PageGridComponent', () => {
  let component: PageGridComponent;
  let fixture: ComponentFixture<PageGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
