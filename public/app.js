// Sample menu items with images
const menuItems = [
    { id: 1, name: 'Pizza', price: 300, image: 'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' },
    { id: 2, name: 'Burger', price: 150, image: 'https://images.pexels.com/photos/156114/pexels-photo-156114.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' },
    { id: 3, name: 'Pasta', price: 200, image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' },
    { id: 4, name: 'Salad', price: 100, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' },
    { id: 5, name: 'Soup', price: 80, image: 'https://images.pexels.com/photos/6287762/pexels-photo-6287762.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' }
];

let order = [];
const baseURL = "https://food-ordering-app-6xq4.onrender.com"; // Your backend URL

// Function to display the menu for customers
function displayMenu() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = ''; // Clear previous items
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.classList.add('menu-item');
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>₹${item.price}</p>
            <button class="add-button" onclick="addToOrder(${item.id})">Add to Order</button>
        `;
        menuContainer.appendChild(menuItem);
    });
}

// Function to add an item to the order
function addToOrder(itemId) {
    const item = menuItems.find(menuItem => menuItem.id === itemId);
    order.push(item);
    updateOrder();
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

// Registration function
async function register(role) {
    const username = document.getElementById(`register-username-${role}`).value;
    const password = document.getElementById(`register-password-${role}`).value;

    if (username && password) {
        try {
            const response = await fetch(`${baseURL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role }) // Send role in the body
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            alert('Error registering user');
        }
    } else {
        alert('Please enter a username and password.');
    }
}

// Login function for both customer and owner
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

            // Role validation
            if (data.role !== role) {
                alert(`You are registered as a ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}, please log in to the correct section.`);
                return;
            }

            if (data.message === 'Login successful') {
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

// Function to show the menu for customers
function showMenu() {
    document.getElementById('auth-section-customer').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    document.getElementById('order').style.display = 'block';
    displayMenu();
}

// Function to show orders for restaurant owners
async function showOrders() {
    document.getElementById('auth-section-owner').style.display = 'none';
    document.getElementById('menu').style.display = 'none';
    document.getElementById('order').style.display = 'none';
    document.getElementById('orders-section').style.display = 'block'; // Show orders section

    try {
        const response = await fetch(`${baseURL}/orders`);
        const orders = await response.json();
        const ordersContainer = document.getElementById('orders-list');
        ordersContainer.innerHTML = ''; // Clear previous orders

        orders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-box'); // Style each order box
            orderItem.innerHTML = `<p><strong>${order.username}</strong>: ₹${order.total}</p>`;
            ordersContainer.appendChild(orderItem);
        });
    } catch (error) {
        alert('Error fetching orders');
    }
}

// Functions to show/hide login/register forms
function showCustomerAuth() {
    document.getElementById('user-selection').style.display = 'none';
    document.getElementById('auth-section-customer').style.display = 'block';
}

function showOwnerAuth() {
    document.getElementById('user-selection').style.display = 'none';
    document.getElementById('auth-section-owner').style.display = 'block';
}
