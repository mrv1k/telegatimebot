import { Composer } from "telegraf";
import durationCommands from "./commands/duration";
import durationTimestampCommands from "./commands/duration-timestamp";
import simpleCommands from "./commands/simple-commands";
import timestampCommands from "./commands/timestamp";
import spy from "./commands/spy";

const commands = new Composer();

commands.use(simpleCommands);
commands.use(timestampCommands);
commands.use(durationCommands);
commands.use(durationTimestampCommands);
commands.use(spy);

export default commands;
