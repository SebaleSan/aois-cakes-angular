import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Carro } from './carro';

describe('Carro', () => {
  let component: Carro;
  let fixture: ComponentFixture<Carro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carro],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Carro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
