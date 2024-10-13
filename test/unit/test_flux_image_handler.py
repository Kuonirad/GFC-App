import os
import sys
import unittest
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.gfc_app.flux_image_handler import FluxImageHandler

class TestFluxImageHandler(unittest.TestCase):
    def setUp(self):
        self.api_key = os.environ.get("TOGETHER_API_KEY")
        if not self.api_key:
            self.skipTest("TOGETHER_API_KEY not set in environment variables")
        self.handler = FluxImageHandler(self.api_key)

    def test_fetch_flux_image(self):
        prompt = "A serene mountain landscape"
        image_path = self.handler.fetch_flux_image(prompt)
        self.assertIsNotNone(image_path, "Failed to fetch flux image")
        self.assertTrue(Path(image_path).exists(), f"Image file does not exist: {image_path}")

    def test_process_image_for_animation(self):
        prompt = "A futuristic city skyline"
        animated_path = self.handler.process_image_for_animation(prompt)
        self.assertIsNotNone(animated_path, "Failed to process image for animation")
        self.assertTrue(Path(animated_path).exists(), f"Animated image file does not exist: {animated_path}")

    def test_animation_frame_count(self):
        prompt = "A blooming flower"
        animated_path = self.handler.process_image_for_animation(prompt, num_frames=10)
        self.assertIsNotNone(animated_path, "Failed to process image for animation")
        self.assertTrue(Path(animated_path).exists(), f"Animated image file does not exist: {animated_path}")

        # Check if the generated GIF has the correct number of frames
        from PIL import Image
        with Image.open(animated_path) as img:
            frame_count = 0
            try:
                while True:
                    img.seek(frame_count)
                    frame_count += 1
            except EOFError:
                pass
        self.assertEqual(frame_count, 10, f"Expected 10 frames, but got {frame_count}")

if __name__ == "__main__":
    unittest.main()
