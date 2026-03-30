export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  name: string;
  area?: string;
  location: Location;
  image?: string;
}
