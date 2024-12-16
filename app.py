from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Google Play Developer API Configuration
DEVELOPER_API_KEY = 'YOUR_GOOGLE_PLAY_API_KEY'  # Your Google Play API key
PACKAGE_NAME = 'com.example.yourapp'  # Your app package name
API_URL = "https://androidpublisher.googleapis.com/v3/applications/{}/purchases/products/{}/tokens/{}"

@app.route('/verify_purchase', methods=['POST'])
def verify_purchase():
    try:
        # Get purchase token from the request
        purchase_token = request.json.get('purchase_token')
        product_id = 'pro_version'  # The SKU for the Pro version

        if not purchase_token:
            return jsonify({"status": "error", "message": "Purchase token is missing!"}), 400

        # Verify purchase with Google Play Developer API
        url = API_URL.format(PACKAGE_NAME, product_id, purchase_token)
        headers = {
            'Authorization': f'Bearer {DEVELOPER_API_KEY}'
        }

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            purchase_data = response.json()
            if purchase_data['purchaseState'] == 0:  # 0 = PURCHASED
                return jsonify({"status": "success", "message": "Purchase verified!"}), 200
            else:
                return jsonify({"status": "error", "message": "Purchase not valid!"}), 400
        else:
            return jsonify({"status": "error", "message": "Failed to verify purchase with Google Play!"}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
