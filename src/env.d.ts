declare namespace NodeJS {
  export interface ProcessEnv {
    BOT_TOKEN: string;
    BOT_USERNAME: string;
    YOUTUBE_API_KEY: string;

    REDIS_PORT: number;
    REDIS_HOST: string;
    REDIS_PASSWORD: string;
  }
}
