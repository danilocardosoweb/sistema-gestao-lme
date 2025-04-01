from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({"message": "Servidor de teste rodando na porta 5000!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
