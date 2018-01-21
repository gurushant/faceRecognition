import face_lib as face_recognition
import cv2
import flask
from flask_cors import CORS, cross_origin
import tornado.wsgi
import tornado.httpserver
import werkzeug
from werkzeug import secure_filename
from werkzeug.contrib.fixers import ProxyFix
from flask import render_template, send_from_directory, request, redirect, url_for
import uuid
import sys
import os, fnmatch
import base64
from flask import jsonify

UPLOAD_DIR = 'face_verification_imgs'
# Obtain the flask app object
app = flask.Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/faceVerification', methods=['POST', 'GET'])
def validate_faces():
    if request.method == 'POST':
        data = dict(request.form)
        img_data = data["inputImg1"][0]
        img_name = str(uuid.uuid4()) + ".jpg"
        img_data = img_data[22:]
        image_1 = os.path.join(UPLOAD_DIR, img_name)
        fh = open(image_1, "wb")
        fh.write(base64.b64decode(img_data))
        fh.close()


        img_data = data["inputImg2"][0]
        img_name = str(uuid.uuid4()) + ".jpg"
        img_data = img_data[22:]
        image_2 = os.path.join(UPLOAD_DIR, img_name)
        fh = open(image_2, "wb")
        fh.write(base64.b64decode(img_data))
        fh.close()

        first_image = face_recognition.load_image_file(image_1)
        second_image = face_recognition.load_image_file(image_2)
        first_image_encoding = face_recognition.face_encodings(first_image)[0]
        second_image_encoding = face_recognition.face_encodings(second_image)[0]
        results = face_recognition.compare_faces([first_image_encoding], second_image_encoding,tolerance=0.58)
        print (results[0])
        out = {"status": "SUCCESS", "message": "Successfully processed", "data": bool(results[0])}
        return jsonify(out)



def start_tornado(app, port=5000):
    http_server = tornado.httpserver.HTTPServer(
        tornado.wsgi.WSGIContainer(app))
    ##,ssl_options = { "certfile": "/home/koustubh/catfish.pem"})
    http_server.listen(port)
    print("Tornado server starting on port {}".format(port))
    tornado.ioloop.IOLoop.instance().start()


app.wsgi_app = ProxyFix(app.wsgi_app)
# start_from_terminal(app)

if __name__ == '__main__':
    # logger.info('Running the main function')
    app.run(host="0.0.0.0", port=int("5006"), debug=True, use_reloader=False)
    # spoof_graph=load_graph('bigvision_spoof_jan3_resnet.pb')
    start_tornado(app)

