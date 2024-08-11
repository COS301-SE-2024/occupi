//University Coordinates

const polygon = [
    { latitude: -25.755736, longitude: 28.225309 }, // Point 1
    { latitude: -25.751353, longitude: 28.229415 }, // Point 2
    { latitude: -25.757187, longitude: 28.235076 }, // Point 3
    { latitude: -25.754989, longitude: 28.235915 }, // Point 4
    { latitude: -25.753780, longitude: 28.231629 }, // Point 5
    { latitude: -25.752242, longitude: 28.231828 }, // Point 6
  ];

export const isPointInPolygon = (point: { latitude: number; longitude: number }) => {
    let x = point.latitude;
    let y = point.longitude;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i].latitude, yi = polygon[i].longitude;
      let xj = polygon[j].latitude, yj = polygon[j].longitude;

      let intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };