import os
from pathlib import Path
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import requests
from io import BytesIO
from openai import OpenAI
import logging
import torch.quantization

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

import torch
import torch.nn as nn
import numpy as np

class Generator(nn.Module):
    def __init__(self, latent_dim, img_shape):
        super(Generator, self).__init__()
        self.img_shape = img_shape
        def block(in_feat, out_feat, normalize=True):
            layers = [nn.Linear(in_feat, out_feat)]
            if normalize:
                layers.append(nn.LayerNorm(out_feat))
            layers.append(nn.LeakyReLU(0.2, inplace=True))
            return layers

        self.model = nn.Sequential(
            *block(latent_dim, 128, normalize=False),
            *block(128, 256),
            *block(256, 512),
            *block(512, 1024),
            nn.Linear(1024, int(np.prod(img_shape))),
            nn.Tanh()
        )

    def forward(self, z):
        img = self.model(z)
        img = img.view(img.size(0), *self.img_shape)
        return img

class FluxImageHandler:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get("TOGETHER_API_KEY")
        if not self.api_key:
            raise ValueError("TOGETHER_API_KEY not set in environment variables or provided")
        self.base_url = "https://api.together.xyz/v1"
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        self.latent_dim = 100
        self.img_shape = (3, 64, 64)
        self.generator = Generator(self.latent_dim, self.img_shape)
        if os.path.exists("generator.pth"):
            self.generator.load_state_dict(torch.load("generator.pth"))
        self.generator.eval()  # Set the generator to evaluation mode

        # Quantize the model
        self.generator_quantized = torch.quantization.quantize_dynamic(
            self.generator, {nn.Linear}, dtype=torch.qint8
        )
        self.generator_quantized.eval()  # Set the quantized generator to evaluation mode

        # Verify all submodules are in evaluation mode
        for module in self.generator_quantized.modules():
            if isinstance(module, nn.Module):
                module.eval()

        logging.info("FluxImageHandler initialized successfully")
        logging.info(f"Generator mode: {self.generator.training}")
        logging.info(f"Quantized Generator mode: {self.generator_quantized.training}")

    def fetch_flux_image(self, prompt, width=512, height=512):
        try:
            response = self.client.images.generate(
                model="flux-1.1-pro",
                prompt=prompt,
                n=1,
                size=f"{width}x{height}"
            )
            image_url = response.data[0].url
            image_response = requests.get(image_url)
            image_response.raise_for_status()
            image = Image.open(BytesIO(image_response.content))
            return image
        except Exception as e:
            logging.error(f"Error fetching flux image: {str(e)}")
            return None

    def process_image_for_animation(self, initial_prompt, num_frames=30):
        try:
            initial_image = self.fetch_flux_image(initial_prompt)
            if initial_image is None:
                return None

            frames = []
            transform = transforms.Compose([
                transforms.Resize(self.img_shape[1:]),
                transforms.ToTensor(),
                transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
            ])

            initial_tensor = transform(initial_image).unsqueeze(0)
            z1 = torch.randn(1, self.latent_dim)
            z2 = torch.randn(1, self.latent_dim)

            self.generator_quantized.eval()  # Ensure the model is in evaluation mode
            with torch.no_grad():  # Disable gradient calculation
                for i in range(num_frames):
                    t = i / (num_frames - 1)
                    z = (1 - t) * z1 + t * z2
                    generated = self.generator_quantized(z)
                    frame = transforms.ToPILImage()(generated.squeeze(0) * 0.5 + 0.5)
                    frames.append(frame)

            output_path = "animated_flux.gif"
            frames[0].save(output_path, save_all=True, append_images=frames[1:], duration=100, loop=0)
            logging.info(f"Animation saved to {output_path}")
            return output_path
        except Exception as e:
            logging.error(f"Error processing image for animation: {str(e)}")
            return None

    def test_single_input(self):
        try:
            z = torch.randn(1, self.latent_dim)
            with torch.no_grad():
                generated = self.generator_quantized(z)
            logging.info("Single input test passed successfully")
            return True
        except Exception as e:
            logging.error(f"Error in single input test: {str(e)}")
            return False

# Example usage
if __name__ == "__main__":
    handler = FluxImageHandler()
    if handler.test_single_input():
        result = handler.process_image_for_animation("A serene mountain landscape")
        if result:
            print(f"Animation created successfully: {result}")
        else:
            print("Failed to create animation")
    else:
        print("Single input test failed")

# [Existing example usage remains unchanged]

# Example usage
if __name__ == "__main__":
    handler = FluxImageHandler()
    animated_path = handler.process_image_for_animation("A futuristic city skyline")
    print(f"Animated image saved to: {animated_path}")

# Example usage
if __name__ == "__main__":
    handler = FluxImageHandler()
    animated_path = handler.process_image_for_animation("A futuristic city skyline")
    print(f"Animated image saved to: {animated_path}")
