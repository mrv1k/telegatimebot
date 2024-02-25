import { Composer } from "telegraf";
import durationCommands from "./duration";
import durationTimestampCommands from "./duration-timestamp";
import simpleCommands from "./simple";
import timestampCommands from "./timestamp";
import spy from "./spy";

const commands = new Composer();

commands.use(simpleCommands);
commands.use(timestampCommands);
commands.use(durationCommands);
commands.use(durationTimestampCommands);
commands.use(spy);

export default commands;
