import requests
import os
from dotenv import load_dotenv
import urllib3

load_dotenv()

BLACK_FOREST_LABS_API_KEY = os.getenv('BLACK_FOREST_LABS_API_KEY')

# Disable SSL warnings (use with caution in production)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def fetchFluxImage(imageId, source='blackforest'):
    if source == 'blackforest':
        url = f"https://api.blackforestlabs.com/v1/flux-images/{imageId}"
        headers = {
            "Authorization": f"Bearer {BLACK_FOREST_LABS_API_KEY}"
        }
        try:
            response = requests.get(url, headers=headers, verify=False)
            response.raise_for_status()
            return response.json()['image_data']
        except requests.exceptions.RequestException as e:
            print(f"Error fetching image from Black Forest Labs: {e}")
            return None
    else:
        print(f"Unsupported source: {source}")
        return None

# Test the function
if __name__ == "__main__":
    # Fetch a list of available flux images
    url = "https://api.blackforestlabs.com/v1/flux-images"
    headers = {
        "Authorization": f"Bearer {BLACK_FOREST_LABS_API_KEY}"
    }
    try:
        response = requests.get(url, headers=headers, verify=False)
        response.raise_for_status()
        flux_images = response.json()
        if flux_images and len(flux_images) > 0:
            test_image_id = flux_images[0]['id']  # Use the first available image ID
            result = fetchFluxImage(test_image_id)
            if result:
                print(f"Successfully fetched flux image with ID: {test_image_id}")
            else:
                print("Failed to fetch flux image")
        else:
            print("No flux images available")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching flux images list: {e}")
