from io import BytesIO
import json
import time
from pydantic import BaseModel
import torch
from fastapi import FastAPI, Form
from PIL import Image
import base64
from fastapi.middleware.cors import CORSMiddleware
from detect import run

app = FastAPI()
# Allow requests from any origin
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ImageData(BaseModel):
    imagedata: str


models = {'yolov5m6': torch.hub.load(
    'ultralytics/yolov5', 'yolov5m6', force_reload=True, skip_validation=True)}


selected_classes1 = ['car', 'person', 'bicycle', 'motorcycle', 'bus', 'truck',
                     'traffic light', 'fire hydrant', 'stop sign', 'cat', 'dog', 'horse', 'cow']


@app.post('/roadassist')
async def predict(image_data: ImageData):
    formatted_outputs = []
    if image_data:
        image_bytes = base64.b64decode(image_data.imagedata)
        im = Image.open(BytesIO(image_bytes))
        im = im.resize((600, 600), Image.ANTIALIAS)
        # reduce size=320 for faster inference
        results = models['yolov5m6'](im, size=600)
        # return results.pandas().xyxy[0].to_json(orient='records')
        filtered_results = results.pandas().xyxy[0]
        filtered_results = filtered_results[filtered_results['name'].isin(
            selected_classes1)]
        # Parse the input string as JSON
        parsed_json = json.loads(filtered_results.to_json(orient='records'))

        for i, json_data in enumerate(parsed_json):
            xmin = json_data["xmin"]
            xmax = json_data["xmax"]
            ymin = json_data["ymin"]
            ymax = json_data["ymax"]

            center_x = (xmin + xmax) / 2
            center_y = (ymin + ymax) / 2

            if center_x < 150:
                side = 'left'
            elif center_x >= 150 and center_x <= 450:
                side = 'front'
            else:
                side = 'right'

            name = json_data["name"]
            if side == 'front':
                data = f'{name} in {side} of you'
            else:
                data = f'{name} to your {side}'
            if data not in formatted_outputs:
                formatted_outputs.append(data)

        return formatted_outputs


@app.post("/facerecognize")
async def detect(imagedata: ImageData):
    final_output = []
    if imagedata.imagedata!="string":
        output = run(base64_image=imagedata.imagedata)
        output = output.split(' ')  # Pass the image path to the run function
        for i in range(len(output) - 1):
            final_output.append(f'This is {output[i]}')
        return final_output
