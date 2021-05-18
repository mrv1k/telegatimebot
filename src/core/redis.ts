import Redis from "ioredis";

// https://github.com/luin/ioredis#tls-options for redis labs
export default new Redis({
  port: 6379,
  host: "127.0.0.1",
  password: "",
});

// https://github.com/luin/ioredis#error-handling
