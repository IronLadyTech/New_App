from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    il_guide_api_key: str = ""

    redis_url: str = ""
    chroma_persist_dir: str = ""
    chroma_collection: str = "iron_lady_curriculum"

    host: str = "0.0.0.0"
    port: int = 8080
    cors_origins: str = "*"

    # WhatsApp Cloud API (Meta) — OTP via an approved authentication template
    whatsapp_token: str = ""
    whatsapp_phone_number_id: str = ""
    whatsapp_api_version: str = "v23.0"
    whatsapp_otp_template: str = "login_otp"
    whatsapp_otp_language: str = "en"

    # Service account JSON (whole file contents) for minting Firebase custom tokens
    firebase_service_account_json: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
