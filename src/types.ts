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
  priceLevel?: number;
  rating?: number | string | null;
  reviewCount?: number | null;
  distance?: number | null;
  discount?: string | number | null;
}
