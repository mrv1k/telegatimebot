import Redis from "ioredis";
import { Settings } from "../parts/settings-commands";

// https://github.com/luin/ioredis#tls-options for redis labs
export default new Redis({
  port: 6379,
  host: "127.0.0.1",
  password: "",
});

// https://github.com/luin/ioredis#error-handling

export const redisKey = (id: number, setting: Settings): string =>
  `${id}:${setting}`;
