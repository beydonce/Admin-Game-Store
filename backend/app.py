from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from models import db
from models.user import User
from models.Game import Game


app = Flask(__name__)  # - create a flask instance
# - enable all routes, allow requests from anywhere (optional - not recommended for security)
CORS(app, resources={r"/*": {"origins": "*"}})

# Specifies the database connection URL. In this case, it's creating a SQLite database
# named 'library.db' in your project directory. The three slashes '///' indicate a
# relative path from the current directory
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///RoeisGames.db'
db.init_app(app)  # initializes the database with the flask application


# Add a game to the database (POST request)
@app.route('/games', methods=['POST'])
def add_game():
    data = request.json  # this is parsing the JSON data from the request body
    new_game = Game(
        name=data['name'],
        creator=data['creator'],
        year_published=data['year_published'],
        genre=data['genre'],
        picture_url=data.get('picture_url')
    )
    db.session.add(new_game)  # add the new game to the database session
    db.session.commit()  # commit the session to save in the database
    return jsonify({'message': 'Game added to database.'}), 201


# Get all games from the database (GET request)
@app.route('/games', methods=['GET'])
def get_games():
    try:
        games = Game.query.all()  # Get all the games from the database

        games_list = []
        for game in games:  # Loop through each game from the database
            game_data = {
                'id': game.id,
                'name': game.name,
                'creator': game.creator,
                'year_published': game.year_published,
                'genre': game.genre,
                'picture_url': game.picture_url
            }
            games_list.append(game_data)

        return jsonify({
            'message': 'Games retrieved successfully',
            'games': games_list
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve games',
            'message': str(e)
        }), 500


# Login route (POST request)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    print(f"Received login request: {data}")  # Debugging

    if not data:
        return jsonify({'message': 'Missing JSON data'}), 400

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.password == password:
        response = jsonify({
            'message': 'Login successful',
            'user_id': user.id,
            'username': user.username
        })
        print(f"Sending response: {response.get_json()}")  # Debugging
        return response, 200

    response = jsonify({'message': 'Invalid credentials'})
    print(f"Sending response: {response.get_json()}")  # Debugging
    return response, 401


# DELETE a game by ID (DELETE request)
@app.route('/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    try:
        game = Game.query.get(game_id)  # Find the game by its ID
        if game:
            db.session.delete(game)  # Delete the game from the database session
            db.session.commit()  # Commit the session to save changes
            return jsonify({'message': 'Game deleted successfully.'}), 200
        else:
            return jsonify({'message': 'Game not found'}), 404
    except Exception as e:
        return jsonify({
            'error': 'Failed to delete game',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create all database tables defined in your models

    app.run(debug=True)  # Start the Flask application in debug mode

    # to run: python3.13 app.py
