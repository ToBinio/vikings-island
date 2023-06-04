import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IslandMenuComponent } from './island-menu.component';

describe('IslandMenuComponent', () => {
  let component: IslandMenuComponent;
  let fixture: ComponentFixture<IslandMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IslandMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IslandMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
