document.addEventListener('DOMContentLoaded', async function () {
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const backBtn = document.getElementById('backBtn');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const editForm = document.getElementById('editForm');

  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('id');

  if (!gameId) {
    alert("No game specified for editing.");
    window.location.href = 'index.html';
    return;
  }

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

  async function fetchGameData() {
    try {
      const response = await fetch(`http://127.0.0.1:5000/games/${gameId}`);
      if (!response.ok) throw new Error("Failed to load data");
      const data = await response.json();
      if (data && data.id) {
        document.getElementById('name').value = data.name;
        document.getElementById('creator').value = data.creator;
        document.getElementById('year_published').value = data.year_published;
        document.getElementById('genre').value = data.genre.toLowerCase();
        document.getElementById('picture_url').value = data.picture_url || '';
        document.getElementById('quantity').value = (data.quantity !== undefined) ? data.quantity : '';
      } else {
        showError("Game data not found.");
      }
    } catch (err) {
      console.error("Error fetching game data:", err);
      showError("Failed to load game data.");
    }
  }

  async function checkDuplicateGame(newName, currentId) {
    try {
      const response = await fetch('http://127.0.0.1:5000/games');
      if (!response.ok) throw new Error("Failed to fetch games.");
      
      const data = await response.json();
      const games = data.games;
      return games.some(game => game.name.toLowerCase() === newName.toLowerCase() && game.id != currentId);
    } catch (e) {
      console.error("Error checking duplicate:", e);
      return false;
    }
  }

  clearBtn.addEventListener('click', function () {
    editForm.reset();
    hideError();
  });

  backBtn.addEventListener('click', function () {
    window.location.href = 'index.html';
  });

  editForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const gameData = {
      name: document.getElementById('name').value.trim(),
      creator: document.getElementById('creator').value.trim(),
      year_published: parseInt(document.getElementById('year_published').value, 10),
      genre: document.getElementById('genre').value.trim(),
      picture_url: document.getElementById('picture_url').value.trim(),
      quantity: document.getElementById('quantity').value.trim() === '' ? 0 : parseInt(document.getElementById('quantity').value, 10)
    };

    showLoading();

    const duplicate = await checkDuplicateGame(gameData.name, gameId);
    if (duplicate) {
      hideLoading();
      alert("A game with this name already exists. Please choose a different name.");
      return;
    }

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

  fetchGameData();
});