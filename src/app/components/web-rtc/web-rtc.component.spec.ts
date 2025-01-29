import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebRTCComponent } from './web-rtc.component';

describe('WebRTCComponent', () => {
  let component: WebRTCComponent;
  let fixture: ComponentFixture<WebRTCComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebRTCComponent]
    });
    fixture = TestBed.createComponent(WebRTCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
