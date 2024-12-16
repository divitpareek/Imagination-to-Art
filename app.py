import razorpay
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)

# Set up database connection
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Razorpay client setup using environment variables
razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

# Model to store user data and their payment status
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    is_pro = db.Column(db.Boolean, default=False)

# Create the database
with app.app_context():
    db.create_all()

# Home route
@app.route('/')
def index():
    return render_template('index.html')

# Route to create a payment order with Razorpay
@app.route('/create_order', methods=['POST'])
def create_order():
    amount = 250 * 100  # Amount in paise (₹250)
    currency = "INR"
    
    order = razorpay_client.order.create(dict(
        amount=amount,
        currency=currency,
        payment_capture='1'  # Automatically capture the payment
    ))

    return jsonify({'order_id': order['id'], 'amount': amount})

# Route to handle the Razorpay payment success
@app.route('/payment_success', methods=['POST'])
def payment_success():
    payment_data = request.form
    payment_id = payment_data['razorpay_payment_id']
    order_id = payment_data['razorpay_order_id']
    signature = payment_data['razorpay_signature']

    # Verify the payment signature
    params = {
        'razorpay_order_id': order_id,
        'razorpay_payment_id': payment_id,
        'razorpay_signature': signature
    }
    
    try:
        razorpay_client.utility.verify_payment_signature(params)
        # Mark user as Pro after successful payment
        # Here, you would update the user's information in the database
        user = User.query.filter_by(email='user@example.com').first()  # Replace with actual user fetching logic
        user.is_pro = True
        db.session.commit()
        return jsonify({"status": "success", "message": "Payment successful! Pro features unlocked."})
    except razorpay.errors.SignatureVerificationError:
        return jsonify({"status": "error", "message": "Payment verification failed!"})

if __name__ == '__main__':
    app.run(debug=True)
