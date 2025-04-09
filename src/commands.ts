import { Composer } from "telegraf";
import durationCommands from "./commands/duration";
import durationTimestampCommands from "./commands/duration-timestamp";
import simpleCommands from "./commands/simple-commands";
import spy from "./commands/spy";
import timestampCommands from "./commands/timestamp";
import type { ContextWithEnv } from "./envs";

const commands = new Composer<ContextWithEnv>();

commands.use(simpleCommands);
commands.use(timestampCommands);
commands.use(durationCommands);
commands.use(durationTimestampCommands);
commands.use(spy);

export default commands;
