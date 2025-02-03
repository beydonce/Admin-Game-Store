from . import db

class Sell(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    buyer_name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    date_sold = db.Column(db.DateTime, nullable=False)

    game = db.relationship('Game', backref=db.backref('sales', lazy=True))  

    