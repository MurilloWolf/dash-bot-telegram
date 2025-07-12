export default function parseCommand(command: string): {
  command: string;
  args: string[];
} {
  const [name, ...args] = command.trim().replace(/^\//, "").split(/\s+/);

  return {
    command: name.toLowerCase(),
    args,
  };
}
