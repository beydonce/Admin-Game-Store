
// script.js

// Function to get all games from the API
async function getGames() {
    try {
      const response = await axios.get('http://127.0.0.1:5000/games');
      const gamesList = document.getElementById('games-list');
      gamesList.innerHTML = ''; // Clear existing list
  
      response.data.games.forEach(game => {
        gamesList.innerHTML += `
          <div class="game-card" id="game-${game.id}">
            <h3>${game.name}</h3>
            <p>Creator: ${game.creator}</p>
            <p>Year: ${game.year_published}</p>
            <p>Genre: ${game.genre}</p>
            ${game.picture_url ? `<img src="${game.picture_url}" alt="${game.name}" class="game-image">` : ''}
            <div class="game-actions">
              <button onclick="editGame(${game.id})">Edit</button>
              <button onclick="delGame(${game.id})">Delete</button>
            </div>
          </div>
        `;
      });
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Failed to load games');
    }
  }
  
  // Function to add a new game to the database
  async function addGame() {
    const name = document.getElementById('game-name').value;
    const creator = document.getElementById('game-creator').value;
    const year_published = document.getElementById('game-year-published').value;
    const genre = document.getElementById('game-genre').value;
    const picture_url = document.getElementById('game-picture-url').value;
  
    try {
      await axios.post('http://127.0.0.1:5000/games', {
        name: name,
        creator: creator,
        year_published: year_published,
        genre: genre,
        picture_url: picture_url
      });
  
      // Clear form fields
      document.getElementById('game-name').value = '';
      document.getElementById('game-creator').value = '';
      document.getElementById('game-year-published').value = '';
      document.getElementById('game-genre').value = '';
      document.getElementById('game-picture-url').value = '';
  
      // Refresh the games list
      getGames();
  
      alert('Game added successfully!');
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Failed to add game');
    }
  }
  
  // Function to delete a game
  async function delGame(gameId) {
    try {
      await axios.delete(`http://127.0.0.1:5000/games/${gameId}`);
      alert('Game deleted successfully!');
      // Remove the game card from the UI
      const gameCard = document.getElementById(`game-${gameId}`);
      if (gameCard) gameCard.remove();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game');
    }
  }
  
// Function to edit a game: redirect to editGame.html with the game ID as a query parameter.
// Redirect to the edit page with the game ID as a query parameter.
function editGame(gameId) {
  window.location.href = `editGame.html?id=${gameId}`;
}


  
  // Function to handle logout - redirect back to the login page
  function logout() {
    // Optionally clear any session storage here
    window.location.href = 'login.html';
  }
  
  // Load all games when the page loads
  document.addEventListener('DOMContentLoaded', getGames);
  