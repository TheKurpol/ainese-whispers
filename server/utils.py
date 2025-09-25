import random
import string

def generate_random_party_id():
    return ''.join(random.choices(string.ascii_uppercase, k=6))

def convert_image_to_base64(image):
    import io
    import base64
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f'data:image/png;base64,{img_str}'