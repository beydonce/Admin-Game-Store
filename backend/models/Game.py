# create a __init__.py file in the models folder to make all the model act as a package if you dont have it already , also you can make one file with all the models just copy ythe all the code in the files into it

from . import db


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    creator = db.Column(db.String(200), nullable=False)
    year_published = db.Column(db.Integer, nullable=False)
    genre = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)  # Ensure quantity has a default
    picture_url = db.Column(db.String(500), nullable=True)
