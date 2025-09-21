from diffusers import StableDiffusionXLPipeline # type: ignore
import torch
import eventlet
from eventlet import tpool
from eventlet.queue import Queue

class ImageGenerator:
    def __init__(self):
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            "segmind/SSD-1B",
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16"
        )
        self.pipe.to("cuda")
        # if using torch < 2.0
        # self.pipe.enable_xformers_memory_efficient_attention()
        self.negative_prompt = "ugly, blurry, poor quality"
        self.images = {}

    def generate_image(self, prompt: str):
        image = self.pipe(prompt=prompt, negative_prompt=self.negative_prompt).images[0] # type: ignore
        return image

image_generator = ImageGenerator()
image_queue = Queue()

def image_worker():
    while True:
        prompt, callback = image_queue.get()
        image = tpool.execute(image_generator.generate_image, prompt)
        callback(image)
        image_queue.task_done()

eventlet.spawn_n(image_worker)

def generate_images(prompts: list[str], final_callback):
    images = []
    for prompt in prompts:
        def make_callback(image):
            images.append(image)
            if len(images) == len(prompts):
                final_callback(images)
        image_queue.put((prompt, make_callback))