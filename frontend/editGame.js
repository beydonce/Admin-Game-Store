document.addEventListener('DOMContentLoaded', async function () {
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const backBtn = document.getElementById('backBtn');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const editForm = document.getElementById('editForm');

  // Get the game ID from the URL query parameter 'id'
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('id');

  if (!gameId) {
    alert("No game specified for editing.");
    window.location.href = 'index.html';
    return;
  }

  // Functions to show/hide loading and error messages
  function showLoading() {
    loading.style.display = 'flex';
    error.style.display = 'none';
  }

  function hideLoading() {
    loading.style.display = 'none';
  }

  function showError(message) {
    hideLoading();
    error.textContent = message;
    error.style.display = 'block';
  }

  function hideError() {
    error.style.display = 'none';
  }

  // Function to load game data from the backend
  async function fetchGameData() {
    try {
      const response = await fetch(`http://127.0.0.1:5000/games/${gameId}`);
      if (!response.ok) throw new Error("Failed to load data");
      const data = await response.json();
      if (data && data.id) {
        document.getElementById('name').value = data.name;
        document.getElementById('creator').value = data.creator;
        document.getElementById('year_published').value = data.year_published;
        document.getElementById('genre').value = data.genre;
        document.getElementById('picture_url').value = data.picture_url || '';
        // Set quantity only if defined; otherwise, leave it blank
        document.getElementById('quantity').value = (data.quantity !== undefined) ? data.quantity : '';
      } else {
        showError("Game data not found.");
      }
    } catch (err) {
      console.error("Error fetching game data:", err);
      showError("Failed to load game data.");
    }
  }

  // Function to check for duplicate game name (ignoring case and the current game)
  async function checkDuplicateGame(newName, currentId) {
    try {
      const response = await axios.get('http://127.0.0.1:5000/games');
      const games = response.data.games;
      return games.some(game => game.name.toLowerCase() === newName.toLowerCase() && game.id != currentId);
    } catch (e) {
      console.error("Error checking duplicate:", e);
      // If duplicate check fails, allow update (or you could block it—depending on your desired behavior)
      return false;
    }
  }

  // Clear form fields when the Clear button is clicked
  clearBtn.addEventListener('click', function () {
    editForm.reset();
    hideError();
  });

  // Return to the games page when the Return button is clicked
  backBtn.addEventListener('click', function () {
    window.location.href = 'index.html';
  });

  // Handle form submission for saving changes
  editForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Construct the updated game object from form values
    const gameData = {
      name: document.getElementById('name').value.trim(),
      creator: document.getElementById('creator').value.trim(),
      year_published: parseInt(document.getElementById('year_published').value, 10),
      genre: document.getElementById('genre').value.trim(),
      picture_url: document.getElementById('picture_url').value.trim(),
      // Allow quantity to be 0 if provided; default to 0 if the field is empty
      quantity: document.getElementById('quantity').value.trim() === '' ? 0 : parseInt(document.getElementById('quantity').value, 10)
    };

    // Show loading indicator
    showLoading();

    // Check for duplicate game name (ignoring case) for games other than the current one
    const duplicate = await checkDuplicateGame(gameData.name, gameId);
    if (duplicate) {
      hideLoading();
      alert("A game with this name already exists. Please choose a different name.");
      return;
    }

    // Send updated data to backend via PUT request
    try {
      const res = await fetch(`http://127.0.0.1:5000/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
      });
      const result = await res.json();
      hideLoading();
      if (result.message === "Game updated successfully.") {
        window.location.href = 'index.html';
      } else {
        showError("Update failed. Please try again.");
      }
    } catch (err) {
      console.error("Error updating game:", err);
      showError("Failed to update game.");
    }
  });

  // Load game data when the page loads
  fetchGameData();
});
