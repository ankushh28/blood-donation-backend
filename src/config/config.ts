import { config as conf } from "dotenv";
conf();

const _config = {
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    IMAGE_BACKEND_URL:process.env.IMAGE_BACKEND_URL,
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS
}


export const config = Object.freeze(_config)