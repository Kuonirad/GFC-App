import tensorflow as tf
from tensorflow import keras
import numpy as np
from dataAcquisition import fetchFluxImage
from dataPreprocessing import preprocessFluxImage, applyDataAugmentation
import requests
import json
import os
from dotenv import load_dotenv
import tensorboard
from tensorflow.keras.models import load_model
from tensorflow_model_optimization.sparsity import keras as sparsity
import datetime

load_dotenv()

LUMA_API_KEY = os.getenv('LUMA_API_KEY')
RUNWAYML_API_KEY = os.getenv('RUNWAYML_API_KEY')

# TensorBoard setup
log_dir = "logs/fit/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1)

def create_generator():
    model = keras.Sequential([
        keras.layers.Dense(7*7*256, use_bias=False, input_shape=(100,)),
        keras.layers.BatchNormalization(),
        keras.layers.LeakyReLU(),

        keras.layers.Reshape((7, 7, 256)),

        keras.layers.Conv2DTranspose(128, (5, 5), strides=(1, 1), padding='same', use_bias=False),
        keras.layers.BatchNormalization(),
        keras.layers.LeakyReLU(),

        keras.layers.Conv2DTranspose(64, (5, 5), strides=(2, 2), padding='same', use_bias=False),
        keras.layers.BatchNormalization(),
        keras.layers.LeakyReLU(),

        keras.layers.Conv2DTranspose(3, (5, 5), strides=(2, 2), padding='same', use_bias=False, activation='tanh')
    ])
    return model

def create_discriminator():
    model = keras.Sequential([
        keras.layers.Conv2D(64, (5, 5), strides=(2, 2), padding='same', input_shape=[28, 28, 3]),
        keras.layers.LeakyReLU(),
        keras.layers.Dropout(0.3),

        keras.layers.Conv2D(128, (5, 5), strides=(2, 2), padding='same'),
        keras.layers.LeakyReLU(),
        keras.layers.Dropout(0.3),

        keras.layers.Flatten(),
        keras.layers.Dense(1)
    ])
    return model

def train_gan(generator, discriminator, dataset, epochs=50, batch_size=32):
    cross_entropy = keras.losses.BinaryCrossentropy(from_logits=True)
    generator_optimizer = keras.optimizers.Adam(1e-4)
    discriminator_optimizer = keras.optimizers.Adam(1e-4)

    @tf.function
    def train_step(images):
        noise = tf.random.normal([batch_size, 100])

        with tf.GradientTape() as gen_tape, tf.GradientTape() as disc_tape:
            generated_images = generator(noise, training=True)

            real_output = discriminator(images, training=True)
            fake_output = discriminator(generated_images, training=True)

            gen_loss = cross_entropy(tf.ones_like(fake_output), fake_output)
            disc_loss = cross_entropy(tf.ones_like(real_output), real_output) + cross_entropy(tf.zeros_like(fake_output), fake_output)

        gradients_of_generator = gen_tape.gradient(gen_loss, generator.trainable_variables)
        gradients_of_discriminator = disc_tape.gradient(disc_loss, discriminator.trainable_variables)

        generator_optimizer.apply_gradients(zip(gradients_of_generator, generator.trainable_variables))
        discriminator_optimizer.apply_gradients(zip(gradients_of_discriminator, discriminator.trainable_variables))

        return gen_loss, disc_loss

    for epoch in range(epochs):
        for image_batch in dataset:
            gen_loss, disc_loss = train_step(image_batch)
        print(f'Epoch {epoch + 1}/{epochs}, Gen Loss: {gen_loss:.4f}, Disc Loss: {disc_loss:.4f}')

        # Log metrics to TensorBoard
        with tf.summary.create_file_writer(log_dir).as_default():
            tf.summary.scalar('generator_loss', gen_loss, step=epoch)
            tf.summary.scalar('discriminator_loss', disc_loss, step=epoch)

def load_and_preprocess_data(num_images=1000):
    images = []
    for _ in range(num_images):
        try:
            image_data = fetchFluxImage(str(np.random.randint(1000000)), 'blackforest')
            preprocessed_image = preprocessFluxImage(image_data, 'blackforest')
            augmented_image = applyDataAugmentation(preprocessed_image)
            images.append(augmented_image)
        except Exception as e:
            print(f"Error processing image: {str(e)}")
    return tf.data.Dataset.from_tensor_slices(images).batch(32)

def luma_animate_image(image):
    url = "https://api.luma-ai.com/v1/animate"
    headers = {
        "Authorization": f"Bearer {LUMA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "image": image.tolist(),
        "num_frames": 30,
        "fps": 30
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()['animation']
    else:
        print(f"Error with Luma API: {response.status_code}")
        return None

def runwayml_generate_image(prompt):
    url = "https://api.runwayml.com/v1/generate"
    headers = {
        "Authorization": f"Bearer {RUNWAYML_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": prompt,
        "num_outputs": 1,
        "width": 512,
        "height": 512
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()['generated_images'][0]
    else:
        print(f"Error with RunwayML API: {response.status_code}")
        return None

def compress_model(model, num_train_samples):
    end_step = num_train_samples * 5  # Assuming 5 epochs for pruning
    pruning_params = {
      'pruning_schedule': sparsity.PolynomialDecay(initial_sparsity=0.50,
                                                   final_sparsity=0.90,
                                                   begin_step=0,
                                                   end_step=end_step)
    }
    model_pruned = sparsity.prune_low_magnitude(model, **pruning_params)
    return model_pruned

def main():
    generator = create_generator()
    discriminator = create_discriminator()

    dataset = load_and_preprocess_data()
    num_train_samples = len(dataset)

    train_gan(generator, discriminator, dataset)

    # Compress the model
    compressed_generator = compress_model(generator, num_train_samples)

    # Generate a new image
    noise = tf.random.normal([1, 100])
    generated_image = compressed_generator(noise, training=False)

    # Animate the generated image using Luma API
    animated_image = luma_animate_image(generated_image[0].numpy())

    if animated_image:
        # Save the animated image
        with open('animated_flux_image.gif', 'wb') as f:
            f.write(animated_image)
        print("Animated image saved successfully")

        # Generate a new image based on the animated image using RunwayML
        prompt = "A futuristic landscape based on the animated flux image"
        final_image = runwayml_generate_image(prompt)
        if final_image:
            # Save the final image
            with open('final_generated_image.png', 'wb') as f:
                f.write(final_image)
            print("Final image generated and saved successfully")

    compressed_generator.save('compressed_flux_image_generator.h5')

    print("Model training, compression, and image generation complete.")

if __name__ == "__main__":
    main()

if __name__ == "__main__":
    main()

if __name__ == "__main__":
    main()
