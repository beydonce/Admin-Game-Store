document.addEventListener('DOMContentLoaded', function () {
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const backBtn = document.getElementById('backBtn');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const editForm = document.getElementById('editForm');

  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('id');

  // Fetch game data when the page loads
  function fetchGameData() {
    fetch(`http://127.0.0.1:5000/games/${gameId}`)
      .then((response) => response.ok ? response.json() : Promise.reject('Failed to load data'))
      .then((data) => {
        console.log(data); // Log data to check if 'quantity' is present
        if (data && data.id) {
          document.getElementById('name').value = data.name;
          document.getElementById('creator').value = data.creator;
          document.getElementById('year_published').value = data.year_published;
          document.getElementById('genre').value = data.genre;
          document.getElementById('picture_url').value = data.picture_url || '';
          document.getElementById('quantity').value = data.quantity !== undefined ? data.quantity : ''; // Set quantity value
        } else {
          showError();
        }
      })
      .catch(showError);
  }

  // Show and hide loading spinner
  function showLoading() {
    loading.style.display = 'flex';
    error.style.display = 'none';
  }
  function hideLoading() {
    loading.style.display = 'none';
  }

  // Show error message
  function showError() {
    hideLoading();
    error.style.display = 'block';
  }

  // Hide error message
  function hideError() {
    error.style.display = 'none';
  }

  // Clear form fields
  clearBtn.addEventListener('click', function () {
    editForm.reset();
    hideError();
  });

  // Return to games page
  backBtn.addEventListener('click', function () {
    window.location.href = 'index.html';
  });

  // Handle form submission to save the game
  editForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const gameData = {
      name: document.getElementById('name').value.trim(),
      creator: document.getElementById('creator').value.trim(),
      year_published: parseInt(document.getElementById('year_published').value, 10),
      genre: document.getElementById('genre').value.trim(),
      picture_url: document.getElementById('picture_url').value.trim(),
      quantity: parseInt(document.getElementById('quantity').value, 10) || 0 // Save quantity value
    };

    showLoading();

    fetch(`http://127.0.0.1:5000/games/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameData)
    })
      .then((response) => response.json())
      .then((data) => {
        hideLoading();
        if (data.message === "Game updated successfully.") {
          window.location.href = 'index.html';
        } else {
          showError();
        }
      })
      .catch(showError);
  });

  // Fetch game data on page load
  fetchGameData();
});
