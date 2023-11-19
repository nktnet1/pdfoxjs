export const getActionFromKey = (keys, commands, config) => {
  for (const command of commands) {
    if (keys[keys.length - 1] === command) {
      return config.commands[command];
    }

    const cmdKeys = command.split(config.settings.commandSeparator);

    if (keys.length < cmdKeys.length) {
      continue;
    }

    for (let i = keys.length - 1; i >= 0; --i) {
      const s = cmdKeys.pop();
      if (keys[i] !== s) {
        break;
      }

      if (cmdKeys.length === 0) {
        return config.commands[command];
      }
    }
  }
  return null;
};
