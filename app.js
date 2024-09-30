// Sample menu items with images
const menuItems = [
    { id: 1, name: 'Pizza', price: 300, image: 'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' },
    { id: 2, name: 'Burger', price: 150, image: 'https://images.pexels.com/photos/156114/pexels-photo-156114.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' },
    { id: 3, name: 'Pasta', price: 200, image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' },
    { id: 4, name: 'Salad', price: 100, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' },
    { id: 5, name: 'Soup', price: 80, image: 'https://images.pexels.com/photos/6287762/pexels-photo-6287762.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' }
];

let order = [];

// Function to display the menu
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
            <button onclick="addToOrder(${item.id})">Add to Order</button>
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
    totalPriceElement.textContent = totalPrice;
}

// Submit order function (updated to send data to the backend)
async function submitOrder() {
    const username = document.getElementById('login-username').value; // Assuming user is logged in
    if (order.length === 0) {
        alert('Your order is empty!');
        return;
    }

    const totalPrice = order.reduce((total, item) => total + item.price, 0);

    try {
        const response = await fetch('http://localhost:5000/submit-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, items: order, total: totalPrice })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            order = []; // Clear the order after successful submission
            updateOrder(); // Assuming this function updates the UI
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error submitting order: ' + error.message);
    }
}




// Registration function (updated to send data to the backend)
async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (username && password) {
        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
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

// Login function (updated to send data to the backend)
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username && password) {
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.message === 'Login successful') {
                showMenu();
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

// Function to show the menu and hide login form after successful login
function showMenu() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    document.getElementById('order').style.display = 'block';
    displayMenu();
}
