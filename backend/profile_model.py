import torch
from torch.profiler import profile, record_function, ProfilerActivity
from src.gfc_app.flux_image_handler import FluxImageHandler, Generator

def profile_model():
    handler = FluxImageHandler()
    latent_dim = 100
    img_shape = (3, 64, 64)
    generator = Generator(latent_dim, img_shape)

    with profile(activities=[ProfilerActivity.CPU], record_shapes=True) as prof:
        with record_function('model_inference'):
            z = torch.randn(1, latent_dim)
            generated_img = generator(z)

    print(prof.key_averages().table(sort_by='cpu_time_total', row_limit=10))

if __name__ == "__main__":
    profile_model()
