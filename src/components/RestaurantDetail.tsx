import React from 'react';
import { Restaurant } from '../types';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onClose: () => void;
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ restaurant, onClose }) => (
  <div style={{ border: '2px solid #333', borderRadius: 12, padding: 24, background: '#fff', position: 'relative' }}>
    <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8 }}>Close</button>
    <h2>{restaurant.name}</h2>
    <p>Latitude: {restaurant.location.lat}</p>
    <p>Longitude: {restaurant.location.lng}</p>
  </div>
);

export default RestaurantDetail;
