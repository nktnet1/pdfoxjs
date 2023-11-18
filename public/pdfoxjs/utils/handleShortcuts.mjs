export const getActionFromKey = (keys, commands, commandToAction) => {
  for (const command of commands) {
    if (keys[keys.length - 1] === command) {
      return commandToAction[command];
    }

    if (keys.length < command.length) {
      continue;
    }

    const cmdKeys = command.split('');

    for (let i = keys.length - 1; i >= 0; --i) {
      const s = cmdKeys.pop();
      if (keys[i] !== s) {
        break;
      }

      if (cmdKeys.length === 0) {
        return commandToAction[command];
      }
    }
  }
  return null;
};
