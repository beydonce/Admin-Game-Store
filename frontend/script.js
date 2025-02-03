// Function to get all games from the API
async function getGames() {
    try {
        const response = await axios.get('http://127.0.0.1:5000/games');
        // Use the 'games' key from the response object
        const games = response.data.games;
        const gamesContainer = document.getElementById('games-container');
  
        gamesContainer.innerHTML = ''; // Clear the container before reloading
  
        if (Array.isArray(games) && games.length > 0) {
            games.forEach(game => {
                const gameCard = document.createElement('div');
                gameCard.classList.add('game-card');
                gameCard.id = `game-${game.id}`;
  
                gameCard.innerHTML = `
                    <img src="${game.picture_url || 'default-image.jpg'}" alt="${game.name}">
                    <div class="card-content">
                        <h3>${game.name}</h3>
                        <p><strong>Creator:</strong> ${game.creator}</p>
                        <p><strong>Year:</strong> ${game.year_published}</p>
                        <p><strong>Genre:</strong> ${game.genre}</p>
                        <p><strong>Quantity:</strong> ${game.quantity}</p>
                    </div>
                    <div class="game-actions">
                        <button onclick="editGame(${game.id})">Edit</button>
                        <button onclick="delGame(${game.id})">Delete</button>
                    </div>
                `;
                gamesContainer.appendChild(gameCard);
            });
        } else {
            gamesContainer.innerHTML = "<p>No games available.</p>";
        }
    } catch (error) {
        console.error('Error fetching games:', error);
        alert('Failed to load games. Please try again later.');
    }
  }
  
  // Function to add a new game to the database
  async function addGame() {
    const name = document.getElementById('game-name').value.trim();
    const creator = document.getElementById('game-creator').value.trim();
    const year_published = document.getElementById('game-year-published').value.trim();
    const genre = document.getElementById('game-genre').value.trim();
    const quantity = document.getElementById('game-quantity').value.trim();
    const picture_url = document.getElementById('game-picture-url').value.trim();
  
    if (!name || !creator || !year_published || !genre) {
        alert('Please fill in all required fields.');
        return;
    }
  
    const yearValue = year_published.match(/^\d{4}$/) ? parseInt(year_published, 10) : null;
    if (yearValue === null) {
        alert('Please enter a valid 4-digit year.');
        return;
    }
  
    const quantityValue = quantity === '' ? 1 : Math.max(1, parseInt(quantity, 10));
  
    try {
        await axios.post('http://127.0.0.1:5000/games', {
            name,
            creator,
            year_published: yearValue,
            genre,
            quantity: quantityValue,
            picture_url
        });
  
        // Clear form fields after adding
        document.getElementById('game-name').value = '';
        document.getElementById('game-creator').value = '';
        document.getElementById('game-year-published').value = '';
        document.getElementById('game-genre').value = '';
        document.getElementById('game-quantity').value = '';
        document.getElementById('game-picture-url').value = '';
  
        // Refresh the games list
        getGames();
        alert('Game added successfully!');
    } catch (error) {
        console.error('Error adding game:', error);
        alert('Failed to add game. Please check your inputs.');
    }
  }
  
  // Function to delete a game
  async function delGame(gameId) {
    if (!confirm('Are you sure you want to delete this game?')) return;
  
    try {
        await axios.delete(`http://127.0.0.1:5000/games/${gameId}`);
        alert('Game deleted successfully!');
        
        // Remove the game card from the UI
        const gameCard = document.getElementById(`game-${gameId}`);
        if (gameCard) gameCard.remove();
    } catch (error) {
        console.error('Error deleting game:', error);
        alert('Failed to delete game. Please try again.');
    }
  }
  
  // Function to edit a game: redirect to editGame.html with the game ID as a query parameter
  function editGame(gameId) {
    window.location.href = `editGame.html?id=${gameId}`;
  }
  
  // Function to handle logout - redirect back to the login page
  function logout() {
    window.location.href = 'login.html';
  }
  
  // Load all games when the page loads
  document.addEventListener('DOMContentLoaded', getGames);
  