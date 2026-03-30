from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import mysql.connector
import os

# Flask Setup
app = Flask(__name__, template_folder=os.getcwd(), static_folder=os.getcwd(), static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}}) # Sabhi connections allow karne ke liye

# XAMPP Database Config
db_config = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': '', 
    'database': 'game_db'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save-score', methods=['POST', 'OPTIONS'])
def save_score():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    data = request.get_json()
    name = data.get('name', 'Player')
    score = data.get('score', 0)
    
    connection = None
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        # Data Insert
        cursor.execute("INSERT INTO leaderboard (player_name, score) VALUES (%s, %s)", (name, score))
        connection.commit()
        
        # Fetch Top 5
        cursor.execute("SELECT player_name, score FROM leaderboard ORDER BY score DESC LIMIT 5")
        rows = cursor.fetchall()
        
        leaderboard = [{"name": r[0], "score": r[1]} for r in rows]
        
        cursor.close()
        return jsonify({"status": "success", "leaderboard": leaderboard})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            connection.close()

if __name__ == '__main__':
    print("--- GAME SERVER STARTED ---")
    print("Link: http://127.0.0.1:8000")
    # Host 0.0.0.0 connections ko stable banata hai
    app.run(debug=True, port=8000, host='0.0.0.0')
