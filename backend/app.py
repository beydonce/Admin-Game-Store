from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db
from models.user import User
from models.Game import Game
from models.Customer import Customer

app = Flask(__name__)  # Create a Flask instance
# Enable CORS for all routes (for development)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure the database (SQLite in this example)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///RoeisGames.db'
db.init_app(app)  # Initialize the database with the Flask app


@app.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404

        db.session.delete(customer)
        db.session.commit()
        return jsonify({'message': 'Customer deleted successfully'}), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to delete customer',
            'message': str(e)
        }), 500


@app.route('/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404

        data = request.get_json()
        # Update fields if present in the payload
        if 'username' in data:
            customer.username = data['username']
        if 'password' in data and data['password']:
            # Make sure to hash the password if needed!
            customer.password = data['password']
        if 'customer_name' in data:
            customer.customer_name = data['customer_name']
        if 'email' in data:
            customer.email = data['email']
        if 'phone' in data:
            customer.phone = data['phone']
        if 'city' in data:
            customer.city = data['city']
        if 'country' in data:
            customer.country = data['country']

        db.session.commit()
        return jsonify({'message': 'Customer updated successfully'}), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to update customer',
            'message': str(e)
        }), 500

@app.route('/customers', methods=['POST'])
def add_customer():
    data = request.json  # Parse JSON data from the request body
    new_customer = Customer(
        username=data['username'],
        password=data['password'],
        customer_name=data['customer_name'],
        email=data['email'],
        phone=data['phone'],
        city=data['city'],
        country=data['country']
    )
    db.session.add(new_customer)  # Add the new customer to the session
    db.session.commit()       # Commit the session to save changes
    return jsonify({'message': 'Customer added to database.'}), 201

@app.route('/customers', methods=['GET'])
def get_customers():
    try:
        customers = Customer.query.all()  # Retrieve all customers from the database
        customers_list = []
        for customer in customers:
            customer_data = {
                'customer_id': customer.customer_id,  # Use customer_id instead of id
                'username': customer.username,
                'password': customer.password,
                'customer_name': customer.customer_name,
                'email': customer.email,
                'phone': customer.phone,
                'city': customer.city,
                'country': customer.country
            }
            customers_list.append(customer_data)
        return jsonify({
            'message': 'Customers retrieved successfully',
            'customers': customers_list
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve customers',
            'message': str(e)
        }), 500

@app.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    try:
        print(f"Fetching customer with ID: {customer_id}")  # Debug print
        customer = Customer.query.get(customer_id)
        if not customer:
            print("Customer not found")  # Debug print
            return jsonify({'message': 'Customer not found'}), 404
        customer_data = {
            'customer_id': customer.customer_id,
            'username': customer.username,
            'password': customer.password,
            'customer_name': customer.customer_name,
            'email': customer.email,
            'phone': customer.phone,
            'city': customer.city,
            'country': customer.country
        }
        print(f"Customer data: {customer_data}")  # Debug print
        return jsonify(customer_data), 200
    except Exception as e:
        print(f"Exception occurred: {str(e)}")  # Debug print
        return jsonify({
            'error': 'Failed to retrieve customer',
            'message': str(e)
        }), 500


# Add a game (POST)
@app.route('/games', methods=['POST'])
def add_game():
    data = request.json  # Parse JSON data from the request body
    quantity = data.get('quantity', 1)  # Default to 1 if no quantity is provided
    new_game = Game(
        name=data['name'],
        creator=data['creator'],
        year_published=data['year_published'],
        genre=data['genre'],
        picture_url=data.get('picture_url'),
        quantity=quantity  # Store the quantity
    )

    db.session.add(new_game)  # Add the new game to the session
    db.session.commit()       # Commit the session to save changes
    return jsonify({'message': 'Game added to database.'}), 201


# Get all games (GET)
@app.route('/games', methods=['GET'])
def get_games():
    try:
        games = Game.query.all()  # Retrieve all games from the database
        games_list = []
        for game in games:
            game_data = {
                'id': game.id,
                'name': game.name,
                'creator': game.creator,
                'year_published': game.year_published,
                'genre': game.genre,
                'picture_url': game.picture_url,
                'quantity': game.quantity  # Include quantity in the response
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


# Get a single game by ID (GET)
@app.route('/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    try:
        game = Game.query.get(game_id)
        if not game:
            return jsonify({'message': 'Game not found'}), 404
        game_data = {
            'id': game.id,
            'name': game.name,
            'creator': game.creator,
            'year_published': game.year_published,
            'genre': game.genre,
            'picture_url': game.picture_url
        }
        return jsonify(game_data), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve game',
            'message': str(e)
        }), 500

# Login route (POST)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
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
        return response, 200
    response = jsonify({'message': 'Invalid credentials'})
    return response, 401

# Update (edit) a game (PUT)
@app.route('/games/<int:game_id>', methods=['PUT'])
def edit_game(game_id):
    try:
        game = Game.query.get(game_id)
        if not game:
            return jsonify({'message': 'Game not found'}), 404
        data = request.json
        game.name = data.get('name', game.name)
        game.creator = data.get('creator', game.creator)
        game.year_published = data.get('year_published', game.year_published)
        game.genre = data.get('genre', game.genre)
        game.picture_url = data.get('picture_url', game.picture_url)
        game.quantity = data.get('quantity', game.quantity)  # Update quantity if provided
        db.session.commit()
        return jsonify({'message': 'Game updated successfully.'}), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to update game',
            'message': str(e)
        }), 500


# Delete a game (DELETE)
@app.route('/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    try:
        game = Game.query.get(game_id)
        if game:
            db.session.delete(game)
            db.session.commit()
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
    app.run(debug=True)
    

