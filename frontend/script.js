let allGames = [];       // Global variable to store all games
let allCustomers = [];   // Global variable to store all customers

// ------------------- Games Functions -------------------

// Function to get all games from the API
async function getGames() {
  try {
    const response = await axios.get('http://127.0.0.1:5000/games');
    allGames = response.data.games || [];
    renderFilteredAndSortedGames();
  } catch (error) {
    console.error('Error fetching games:', error);
    showModal('Failed to load games. Please try again later.');
  }
}

// Function to render games based on filter and sort options
function renderFilteredAndSortedGames() {
  const filterGenre = document.getElementById('filter-genre').value;
  const sortBy = document.getElementById('sort-by').value;

  let filteredGames = allGames;
  if (filterGenre !== 'all') {
    filteredGames = filteredGames.filter(game => game.genre.toLowerCase() === filterGenre.toLowerCase());
  }

  // Sorting logic
  if (sortBy === 'quantity-asc') {
    filteredGames.sort((a, b) => a.quantity - b.quantity);
  } else if (sortBy === 'quantity-desc') {
    filteredGames.sort((a, b) => b.quantity - a.quantity);
  } else if (sortBy === 'year-asc') {
    filteredGames.sort((a, b) => a.year_published - b.year_published);
  } else if (sortBy === 'year-desc') {
    filteredGames.sort((a, b) => b.year_published - a.year_published);
  } else if (sortBy === 'name-asc') {
    filteredGames.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'name-desc') {
    filteredGames.sort((a, b) => b.name.localeCompare(a.name));
  }

  const gamesContainer = document.getElementById('games-container');
  const soldGamesList = document.getElementById('sold-games-list');

  gamesContainer.innerHTML = '';
  soldGamesList.innerHTML = '';

  if (filteredGames.length > 0) {
    filteredGames.forEach(game => {
      const gameCard = document.createElement('div');
      gameCard.classList.add('game-card');
      gameCard.id = `game-${game.id}`;

      let soldBadge = '';
      if (parseInt(game.quantity, 10) === 0) {
        soldBadge = `<span class="sold-badge">Sold Out</span>`;
      }

      gameCard.innerHTML = `
        <img src="${game.picture_url || 'default-image.jpg'}" alt="${game.name}">
        <div class="card-content">
            <h3>${game.name}</h3>
            <p><strong>Creator:</strong> ${game.creator}</p>
            <p><strong>Year:</strong> ${game.year_published}</p>
            <p><strong>Genre:</strong> ${game.genre}</p>
            <p><strong>Quantity:</strong> ${game.quantity}</p>
            ${soldBadge}
        </div>
        <div class="game-actions">
            <button onclick="editGame(${game.id})">Edit</button>
            <button onclick="delGame(${game.id})">Delete</button>
        </div>
      `;

      if (parseInt(game.quantity, 10) === 0) {
        soldGamesList.appendChild(gameCard);
      } else {
        gamesContainer.appendChild(gameCard);
      }
    });
  } else {
    gamesContainer.innerHTML = "<p>No games available.</p>";
    soldGamesList.innerHTML = "<p>No sold games available.</p>";
  }
}

// Function to add a new game
async function addGame() {
  const name = document.getElementById('game-name').value.trim();
  const creator = document.getElementById('game-creator').value.trim();
  const year_published = document.getElementById('game-year-published').value.trim();
  const genre = document.getElementById('game-genre').value.trim();
  const quantity = document.getElementById('game-quantity').value.trim();
  const picture_url = document.getElementById('game-picture-url').value.trim();

  if (!name || !creator || !year_published || !genre) {
    showModal('Please fill in all required fields.');
    return;
  }

  const yearValue = year_published.match(/^\d{4}$/) ? parseInt(year_published, 10) : null;
  if (yearValue === null) {
    showModal('Please enter a valid 4-digit year.');
    return;
  }

  const quantityValue = quantity === '' ? 1 : parseInt(quantity, 10);

  // Check for duplicate game name (case-insensitive)
  try {
    const duplicateResponse = await axios.get('http://127.0.0.1:5000/games');
    const games = duplicateResponse.data.games;
    const duplicate = games.find(g => g.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      showModal('A game with this name already exists. Please choose a different name.');
      return;
    }
  } catch (err) {
    console.error('Error checking duplicate game name:', err);
  }

  try {
    await axios.post('http://127.0.0.1:5000/games', {
      name,
      creator,
      year_published: yearValue,
      genre,
      quantity: quantityValue,
      picture_url
    });

    // Clear form fields
    document.getElementById('game-name').value = '';
    document.getElementById('game-creator').value = '';
    document.getElementById('game-year-published').value = '';
    document.getElementById('game-genre').value = '';
    document.getElementById('game-quantity').value = '';
    document.getElementById('game-picture-url').value = '';

    getGames();
    showModal('Game added successfully!', true);
  } catch (error) {
    console.error('Error adding game:', error);
    showModal('Failed to add game. Please check your inputs.');
  }
}

// ------------------- Customers Functions -------------------

// Function to get all customers from the API
async function getCustomers() {
  try {
    const response = await axios.get('http://127.0.0.1:5000/customers');
    allCustomers = response.data.customers || [];
    renderCustomers();
  } catch (error) {
    console.error('Error fetching customers:', error);
    showModal('Failed to load customers. Please try again later.');
  }
}

// Function to render customers
function renderCustomers() {
  const customersContainer = document.getElementById('customers-container');
  customersContainer.innerHTML = '';

  if (allCustomers.length > 0) {
    allCustomers.forEach(customer => {
      const customerCard = document.createElement('div');
      customerCard.classList.add('customer-card');
      customerCard.id = `customer-${customer.customer_id}`;

      customerCard.innerHTML = `
        <h3>${customer.customer_name || customer.username}</h3>
        <p><strong>Username:</strong> ${customer.username}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>City:</strong> ${customer.city}</p>
        <p><strong>Country:</strong> ${customer.country}</p>
        <div class="customer-actions">
          <button onclick="deleteCustomer(${customer.customer_id})">Delete</button>
        </div>
      `;

      customersContainer.appendChild(customerCard);
    });
  } else {
    customersContainer.innerHTML = "<p>No customers available.</p>";
  }
}

// Function to add a new customer
async function addCustomer() {
  const username = document.getElementById('customer-username').value.trim();
  const password = document.getElementById('customer-password').value.trim();
  const customerName = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const city = document.getElementById('customer-city').value.trim();
  const country = document.getElementById('customer-country').value.trim();

  if (!username || !password || !email || !phone || !city || !country) {
    showModal('Please fill in all required customer fields.');
    return;
  }

  try {
    await axios.post('http://127.0.0.1:5000/customers', {
      username,
      password,
      customer_name: customerName,
      email,
      phone,
      city,
      country
    });

    // Clear form fields
    document.getElementById('customer-username').value = '';
    document.getElementById('customer-password').value = '';
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-city').value = '';
    document.getElementById('customer-country').value = '';

    getCustomers();
    showModal('Customer added successfully!', true);
  } catch (error) {
    console.error('Error adding customer:', error);
    showModal('Failed to add customer. Please check your inputs.');
  }
}

// Function to delete a game
async function delGame(gameId) {
  if (!confirm('Are you sure you want to delete this game?')) return;

  try {
    await axios.delete(`http://127.0.0.1:5000/games/${gameId}`);
    showModal('Game deleted successfully!', true);
    const gameCard = document.getElementById(`game-${gameId}`);
    if (gameCard) gameCard.remove();
  } catch (error) {
    console.error('Error deleting game:', error);
    showModal('Failed to delete game. Please try again.');
  }
}

// Function to delete a customer
async function deleteCustomer(customerId) {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  try {
    await axios.delete(`http://127.0.0.1:5000/customers/${customerId}`);
    showModal('Customer deleted successfully!', true);
    const customerCard = document.getElementById(`customer-${customerId}`);
    if (customerCard) customerCard.remove();
  } catch (error) {
    console.error('Error deleting customer:', error);
    showModal('Failed to delete customer. Please try again.');
  }
}

// Function to edit a game: redirect to editGame.html with the game ID as a query parameter
function editGame(gameId) {
  window.location.href = `editGame.html?id=${gameId}`;
}

// Function to handle logout
function logout() {
  localStorage.removeItem('adminName');
  window.location.href = 'login.html';
}

// Simple modal for notifications
function showModal(message, isSuccess = false) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  modalMessage.textContent = message;
  modal.classList.add('active');
  
  // Style adjustments
  if (isSuccess) {
    modal.classList.add('success');
    modal.classList.remove('error');
  } else {
    modal.classList.add('error');
    modal.classList.remove('success');
  }
  
  setTimeout(() => {
    modal.classList.remove('active');
  }, 2000);
}

// Theme toggle: switch between dark and light themes
function toggleTheme() {
  document.body.classList.toggle('light-theme');
}

// Load games by default when the page loads
document.addEventListener('DOMContentLoaded', getGames);
