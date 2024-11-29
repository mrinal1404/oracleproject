import os
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
from diffusers import StableDiffusionXLPipeline
import torch

app = Flask(__name__)
CORS(app)

# Check for CUDA availability
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load Stable Diffusion model
try:
    model_id = "stabilityai/stable-diffusion-xl-base-1.0"
    pipe = StableDiffusionXLPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe = pipe.to(device)
except Exception as e:
    print(f"Model loading error: {e}")
    pipe = None

def generate_resume_image(resume_data):
    try:
        # Create a blank white image
        width, height = 800, 1100
        image = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(image)
        
        # Font handling with fallback
        try:
            name_font = ImageFont.truetype("arial.ttf", 36)
            header_font = ImageFont.truetype("arial.ttf", 24)
            body_font = ImageFont.truetype("arial.ttf", 16)
        except IOError:
            name_font = header_font = body_font = ImageFont.load_default()

        # Draw resume details
        draw.text((50, 50), resume_data.get('name', ''), font=name_font, fill='black')
        draw.text((50, 100), f"Email: {resume_data.get('email', '')}", font=body_font, fill='black')
        draw.text((50, 120), f"Phone: {resume_data.get('phone', '')}", font=body_font, fill='black')

        sections = [
            ("Professional Summary", resume_data.get('summary', '')),
            ("Skills", resume_data.get('skills', '')),
            ("Work Experience", resume_data.get('experience', '')),
            ("Education", resume_data.get('education', ''))
        ]

        y_offset = 200
        for title, content in sections:
            draw.text((50, y_offset), title, font=header_font, fill='black')
            draw.text((50, y_offset + 40), content, font=body_font, fill='black')
            y_offset += 120

        # Text-to-image generation (optional fallback)
        if pipe:
            prompt = f"Professional resume design for {resume_data.get('name', 'Professional')} with clean and modern layout"
            background = pipe(prompt=prompt, height=1100, width=800).images[0]
            blended = Image.blend(background.convert('RGB'), image.convert('RGB'), 0.3)
        else:
            blended = image

        # Save and encode image
        buffered = io.BytesIO()
        blended.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    except Exception as e:
        print(f"Image generation error: {e}")
        return None

@app.route('/generate-resume', methods=['POST'])
def generate_resume():
    resume_data = request.json
    resume_image = generate_resume_image(resume_data)
    
    if resume_image:
        return jsonify({'resume_image': resume_image})
    else:
        return jsonify({'error': 'Resume generation failed'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)