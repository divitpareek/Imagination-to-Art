from flask import Flask, request, jsonify
import google.auth
from google.auth.transport.requests import Request
from google.auth.transport.urllib3 import AuthorizedHttp
import requests
import json

app = Flask(__name__)

# Google Play Developer API Configuration
DEVELOPER_API_KEY = 'YOUR_GOOGLE_PLAY_API_KEY'  # Set your Google Play API key here
PACKAGE_NAME = 'com.example.yourapp'  # Replace with your app's package name
API_URL = "https://androidpublisher.googleapis.com/v3/applications/{}/purchases/products/{}/tokens/{}"

@app.route('/verify_purchase', methods=['POST'])
def verify_purchase():
    try:
        # Get the purchase token from the request body
        purchase_token = request.json.get('purchase_token')
        product_id = 'pro_version'  # Your SKU ID in the Play Console

        if not purchase_token:
            return jsonify({"status": "error", "message": "Purchase token is missing!"}), 400

        # Verify the purchase with Google Play Developer API
        url = API_URL.format(PACKAGE_NAME, product_id, purchase_token)
        headers = {
            'Authorization': f'Bearer {DEVELOPER_API_KEY}'
        }

        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            purchase_data = response.json()
            if purchase_data['purchaseState'] == 0:  # 0 = PURCHASED
                # Handle the successful purchase (e.g., unlocking Pro features)
                return jsonify({"status": "success", "message": "Purchase verified!"}), 200
            else:
                return jsonify({"status": "error", "message": "Purchase not valid!"}), 400
        else:
            return jsonify({"status": "error", "message": "Failed to verify purchase with Google Play!"}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": f"An error occurred: {str(e)}"}), 500

# Example route to handle other requests (e.g., unlocking features)
@app.route('/unlock_pro_features', methods=['POST'])
def unlock_pro_features():
    # This can be expanded based on your app logic to unlock Pro features
    return jsonify({"status": "success", "message": "Pro features unlocked!"})

if __name__ == "__main__":
    app.run(debug=True)
