from flask import Blueprint, request, jsonify
from .storage import saved_searches
import os
import requests

API_KEY = os.getenv("API_KEY")

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/hello')
def hello():
    return jsonify(message="Hello from Flask")

@bp.route('/flights', methods=['GET'])
def search_by_tail_number():
    url = f"http://api.aviationstack.com/v1/flights"
    params = {
        'access_key': API_KEY,
    }

    try:
        res = requests.get(url, params=params)
        res.raise_for_status()
        data = res.json()
        return jsonify(data)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/search', methods=['POST'])
def search_flights():
    data = request.json
    # mock result
    return jsonify({
        "flights": [
            {"from": data["from"], "to": data["to"], "date": data["date"], "price": 199}
        ]
    })

@bp.route('/save-search', methods=['POST'])
def save_search():
    data = request.json
    saved_searches.append(data)
    return jsonify(success=True)

@bp.route('/saved-searches', methods=['GET'])
def get_saved_searches():
    return jsonify(saved_searches)
