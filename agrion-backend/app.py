import os
from dotenv import load_dotenv
from flask import Flask

load_dotenv()

from extensions.neo4j_client import close_driver
from routes.api import api_bp
from routes.sms import sms_bp
from routes.ussd import ussd_bp


def create_app():
    app = Flask(__name__)
    app.register_blueprint(ussd_bp)
    app.register_blueprint(sms_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    return app


app = create_app()


@app.teardown_appcontext
def shutdown_neo4j(exception=None):
    """Release Neo4j driver on app shutdown."""
    close_driver()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
