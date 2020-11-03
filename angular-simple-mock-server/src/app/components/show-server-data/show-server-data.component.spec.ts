import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowServerDataComponent } from './show-server-data.component';

describe('ShowServerDataComponent', () => {
  let component: ShowServerDataComponent;
  let fixture: ComponentFixture<ShowServerDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowServerDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowServerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
