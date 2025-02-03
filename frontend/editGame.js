// editGame.js

// Utility function to extract a query parameter from the URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const gameId = getQueryParam('id');

if (!gameId) {
  alert("No game specified for editing.");
  window.location.href = 'index.html';
}

// Function to load game details using the dedicated GET endpoint
async function loadGameDetails() {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/games/${gameId}`);
    const game = response.data;
    if (!game) {
      alert("Game not found.");
      window.location.href = 'index.html';
      return;
    }
    // Populate the form fields with the current game details
    document.getElementById('game-name').value = game.name;
    document.getElementById('game-creator').value = game.creator;
    document.getElementById('game-year-published').value = game.year_published;
    document.getElementById('game-genre').value = game.genre;
    document.getElementById('game-picture-url').value = game.picture_url || '';
  } catch (error) {
    console.error("Error loading game details:", error);
    alert("Failed to load game details.");
  }
}

// Wrap event registration in DOMContentLoaded to ensure elements are available and listeners are added only once.
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("save-button");
  const returnButton = document.getElementById("return-button");
  const editForm = document.getElementById("edit-game-form");

  // Handle form submission for saving updates
  editForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    // Disable the Save button immediately to prevent duplicate submissions
    saveButton.disabled = true;

    const updatedGame = {
      name: document.getElementById('game-name').value,
      creator: document.getElementById('game-creator').value,
      year_published: document.getElementById('game-year-published').value,
      genre: document.getElementById('game-genre').value,
      picture_url: document.getElementById('game-picture-url').value
    };

    try {
      await axios.put(`http://127.0.0.1:5000/games/${gameId}`, updatedGame);
      alert("Game updated successfully!");
      // Redirect back to index.html immediately after the alert is dismissed
      window.location.href = 'index.html';
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Failed to update game.");
      // Re-enable the save button if the update fails
      saveButton.disabled = false;
    }
  });

  // Handle return button click to go back to the games page without saving
  returnButton.addEventListener("click", function() {
    window.location.href = 'index.html';
  });

  // Load game details when the page is ready
  loadGameDetails();
});
