import Redis from "ioredis";
import { Settings } from "../parts/settings-commands";

// https://github.com/luin/ioredis#error-handling
// https://github.com/luin/ioredis#tls-options for redis labs
const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
  password: "",
});

async function toggleSetting(id: number, setting: Settings): Promise<boolean> {
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
): Promise<boolean> => (await redis.exists(makeRedisKey(id, setting))) === 0;

const makeRedisKey = (id: number, setting: Settings): string =>
  `${id}:${setting}`;

export default redis;
export { getSettingState, toggleSetting };
