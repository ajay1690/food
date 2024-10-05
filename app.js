let order = [];
const baseURL = "https://food-ordering-app-6xq4.onrender.com"; // Your backend URL

// Function to display the menu for customers (now uses restaurant-specific menus)
async function displayMenu() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = ''; // Clear previous items

    try {
        const response = await fetch(`${baseURL}/restaurants`); // Fetch restaurants with their menus
        const restaurants = await response.json();

        // Loop through each restaurant to display its menu
        restaurants.forEach(restaurant => {
            const restaurantMenu = document.createElement('div');
            restaurantMenu.classList.add('restaurant-menu');
            restaurantMenu.innerHTML = `<h2>${restaurant.name}</h2>`;
            
            restaurant.menu.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item');
                menuItem.innerHTML = `
                    <img src="${item.image || 'default_image_url'}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>₹${item.price}</p>
                    <button class="add-button" onclick="addToOrder(${item.id})">Add to Order</button>
                `;
                restaurantMenu.appendChild(menuItem);
            });
            menuContainer.appendChild(restaurantMenu);
        });
    } catch (error) {
        alert('Error fetching menu: ' + error.message);
    }
}

// Function to add an item to the order
function addToOrder(itemId) {
    fetch(`${baseURL}/menu-item/${itemId}`)
        .then(response => response.json())
        .then(item => {
            order.push(item);
            updateOrder();
        })
        .catch(error => alert('Error adding item to order: ' + error.message));
}

// Function to update the order list and total price
function updateOrder() {
    const orderList = document.getElementById('order-list');
    const totalPriceElement = document.getElementById('total-price');

    orderList.innerHTML = ''; // Clear previous items
    order.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} - ₹${item.price}`;
        orderList.appendChild(listItem);
    });

    const totalPrice = order.reduce((total, item) => total + item.price, 0);
    totalPriceElement.textContent = `Total: ₹${totalPrice}`;
}

// Submit order function (sends data to the backend)
async function submitOrder() {
    const username = localStorage.getItem('username'); // Fetch logged-in username from local storage
    if (order.length === 0) {
        alert('Your order is empty!');
        return;
    }

    const totalPrice = order.reduce((total, item) => total + item.price, 0);

    try {
        const response = await fetch(`${baseURL}/submit-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, items: order, total: totalPrice })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            order = []; // Clear the order after successful submission
            updateOrder(); // Update the UI
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error submitting order: ' + error.message);
    }
}

// Registration function for restaurant owners with additional restaurant details
async function register(role) {
    const username = document.getElementById(`register-username-${role}`).value;
    const password = document.getElementById(`register-password-${role}`).value;

    if (role === 'owner') {
        const restaurantName = document.getElementById('restaurant-name').value;
        const menuItems = [];

        // Loop through the menu inputs (dynamic form fields)
        const menuItemElements = document.querySelectorAll('.menu-item-input');
        menuItemElements.forEach((itemElement) => {
            const name = itemElement.querySelector('.menu-item-name').value;
            const price = itemElement.querySelector('.menu-item-price').value;
            const image = itemElement.querySelector('.menu-item-image').value;

            if (name && price) {
                menuItems.push({ name, price, image });
            }
        });

        if (!restaurantName || menuItems.length === 0) {
            alert('Please enter all restaurant details.');
            return;
        }

        // Register the owner and their restaurant details
        try {
            const response = await fetch(`${baseURL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role, restaurantName, menu: menuItems })
            });
            const data = await response.json();

            if (response.ok) {
                alert(`Welcome, ${role === 'owner' ? 'Owner' : 'Customer'}!`);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Error registering user: ' + error.message);
        }
    } else {
        // Customer registration logic remains the same
        try {
            const response = await fetch(`${baseURL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });
            const data = await response.json();

            if (response.ok) {
                alert(`Welcome, ${role === 'owner' ? 'Owner' : 'Customer'}!`);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Error registering user: ' + error.message);
        }
    }
}

// Login function remains the same (showMenu and showOrders used based on role)
async function login(role) {
    const username = document.getElementById(`login-username-${role}`).value;
    const password = document.getElementById(`login-password-${role}`).value;

    if (username && password) {
        try {
            const response = await fetch(`${baseURL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.message === 'Login successful') {
                if (data.role !== role) {
                    alert(`Access Denied: You are registered as a ${data.role}, not a ${role}.`);
                    return;
                }

                localStorage.setItem('username', username);
                localStorage.setItem('role', data.role);

                if (data.role === 'owner') {
                    showOrders(); // Show orders if the user is an owner
                } else {
                    showMenu(); // Show menu for customers
                }
            } else {
                alert('Invalid username or password.');
            }
        } catch (error) {
            alert('Error logging in');
        }
    } else {
        alert('Please enter a username and password.');
    }
}

// Show orders for restaurant owners remains the same
async function showOrders() {
    // Same functionality to display pending orders for the owner
}

// Function to toggle customer and owner registration forms
function showCustomerAuth() {
    document.getElementById('user-selection').style.display = 'none';
    document.getElementById('auth-section-customer').style.display = 'block';
}

function showOwnerAuth() {
    document.getElementById('user-selection').style.display = 'none';
    document.getElementById('auth-section-owner').style.display = 'block';
}
