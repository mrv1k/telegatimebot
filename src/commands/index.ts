import { Composer } from "telegraf";
import durationCommands from "./duration";
import durationTimestampCommands from "./duration-timestamp";
import simpleCommands from "./simple";
import timestampCommands from "./timestamp";

const commands = new Composer();

commands.use(simpleCommands);
commands.use(timestampCommands);
commands.use(durationCommands);
commands.use(durationTimestampCommands);

export default commands;
