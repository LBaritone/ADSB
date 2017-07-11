import os
import re
import requests
import logging
import json
from flask import Flask, jsonify, render_template, request, url_for
from flask_jsglue import JSGlue

app = Flask(__name__)
JSGlue(app) 

# ensure responses aren't cached
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response

@app.route("/")
def index():
    """Render map."""
    return render_template("index.html", key = "AIzaSyCeaDr2jVXSiaNJ3qbAKkDa01D6R9NTx4E")

@app.route("/update")
def update():
	url = "http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?"
	url += "lat=-30.240722&lng=-70.738777&fDstL=0&fDstU=1600"
	planes = requests.get(url)

	print planes.json()

	# print json.dumps(list(planes))

	# return planes

	# return jsonify(list(planes))

	# def set_default(p):
	#     if isinstance(p, set):
	#         return list(p)
	#     raise TypeError

	# json.dumps(planes, default=set_default)

	# print app.response_class(planes.text, content_type='application/json')

	return planes.json()

	# return app.response_class(planes.content, content_type='application/json')

