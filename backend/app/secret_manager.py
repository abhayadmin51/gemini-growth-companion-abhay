from functools import lru_cache

from google.cloud import secretmanager

from app.config import get_settings


@lru_cache(maxsize=1)
def get_gemini_api_key() -> str:
    settings = get_settings()

    client = secretmanager.SecretManagerServiceClient()

    secret_name = (
        f"projects/{settings.google_cloud_project}"
        f"/secrets/{settings.gemini_secret_id}"
        f"/versions/latest"
    )

    response = client.access_secret_version(
        request={"name": secret_name}
    )

    api_key = response.payload.data.decode("UTF-8").strip()

    if not api_key:
        raise RuntimeError("Gemini API key secret is empty.")

    return api_key