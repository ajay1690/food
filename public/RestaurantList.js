import React, { useEffect, useState } from 'react';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants');
        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div>
      <h1>Available Restaurants</h1>
      {restaurants.length > 0 ? (
        restaurants.map((restaurant) => (
          <div key={restaurant._id}>
            <h2>{restaurant.restaurantName}</h2>
            <ul>
              {restaurant.menu.map((item, index) => (
                <li key={index}>
                  {item.itemName}: ₹{item.price}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No restaurants available</p>
      )}
    </div>
  );
};

export default RestaurantList;

