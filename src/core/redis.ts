import Redis from "ioredis";
import { Settings } from "../commands/settings";

// https://github.com/luin/ioredis#error-handling
// https://docs.redislabs.com/latest/rs/references/client_references/client_ioredis/

const options: Redis.RedisOptions = {
  host: "127.0.0.1",
  port: 6379,
  password: "",
  showFriendlyErrorStack: process.env.NODE_ENV !== "production",
};

if (process.env.NODE_ENV === "production") {
  const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD } = process.env;
  if (REDIS_HOST && REDIS_PORT && REDIS_PASSWORD) {
    options.host = REDIS_HOST;
    options.port = Number(REDIS_PORT);
    options.password = REDIS_PASSWORD;
  } else {
    throw new TypeError("Redis ENV variable is missing");
  }
}

const redis = new Redis(options);

// redis.on("error", (err) => {
//   console.log("WIYWIY", err);
// });

async function toggleSetting(id: number, setting: Settings): Promise<boolean> {
  // if (!redis) return false;

  const key = makeRedisKey(id, setting);
  // 0 - enabled, 1 - disabled
  const exists = await redis.exists(key);

  // if it existed, it was disabled, enable it
  if (exists) {
    await redis.del(key);
    return true;
  }
  // set to 1 as it takes less memory than empty string
  await redis.set(key, 1);
  return false;
}

// redis.exists
// 1 if the key exists.
// 0 if the key does not exist.
// Flip that with comparison. Slightly counterintuitive but helps to save redis memory
// if 0 - setting DOESN'T exist. Setting is disabled. Display information
// else - 1 does exist. Setting is enabled. DON'T display information
const getSettingState = async (
  id: number,
  setting: Settings
): Promise<boolean> => {
  // if (!redis) return false;

  const exists = await redis.exists(makeRedisKey(id, setting));
  return exists === 0;
};

const makeRedisKey = (id: number, setting: Settings): string =>
  `${id}:${setting}`;

export default redis;
export { getSettingState, toggleSetting };
