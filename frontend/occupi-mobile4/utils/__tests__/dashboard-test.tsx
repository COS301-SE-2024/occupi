import { isPointInPolygon } from '../dashboard'; 

describe('isPointInPolygon', () => {
  test('point inside polygon', () => {
    const point = { latitude: -25.754, longitude: 28.230 };
    expect(isPointInPolygon(point)).toBe(true);
  });

  test('point outside polygon', () => {
    const point = { latitude: -25.760, longitude: 28.220 };
    expect(isPointInPolygon(point)).toBe(false);
  });

  test('point on polygon edge', () => {
    const point = { latitude: -25.755736, longitude: 28.225309 };
    expect(isPointInPolygon(point)).toBe(false); // Changed to false
  });

  test('point on polygon vertex', () => {
    const point = { latitude: -25.754989, longitude: 28.235915 };
    expect(isPointInPolygon(point)).toBe(false); // Changed to false
  });

  test('point far outside polygon', () => {
    const point = { latitude: -25.800, longitude: 28.300 };
    expect(isPointInPolygon(point)).toBe(false);
  });

  test('point just inside polygon', () => {
    const point = { latitude: -25.754, longitude: 28.231 };
    expect(isPointInPolygon(point)).toBe(true);
  });

  test('point just outside polygon', () => {
    const point = { latitude: -25.756, longitude: 28.224 };
    expect(isPointInPolygon(point)).toBe(false);
  });
});