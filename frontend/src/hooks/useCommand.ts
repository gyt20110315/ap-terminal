import { useCallback } from 'react';
import { useTerminalStore } from '../store/terminalStore';

const COMMANDS: Record<string, { desc: string; handler?: (args: string) => string }> = {
  HELP: {
    desc: 'Show this help message',
    handler: () => 'Sending HELP command...',
  },
  DASH: {
    desc: 'Return to main dashboard view',
    handler: () => 'Returning to dashboard...',
  },
  CLEAR: {
    desc: 'Clear the command output',
    handler: () => '',
  },
  NEWS: {
    desc: 'Search AP-related news (e.g., NEWS AP Calculus)',
    handler: (args) => `Searching news for: "${args}"...`,
  },
  COURSE: {
    desc: 'View specific AP course data (e.g., COURSE CALC AB)',
    handler: (args) => `Loading course data: "${args}"...`,
  },
  STATS: {
    desc: 'View AP statistics by region (e.g., STATS US)',
    handler: (args) => `Loading stats${args ? ' for: "' + args + '"' : ''}...`,
  },
  TREND: {
    desc: 'View enrollment and score trends for a course',
    handler: (args) => `Loading trend data${args ? ' for: "' + args + '"' : ''}...`,
  },
  ALERT: {
    desc: 'Set up a keyword alert (e.g., ALERT exam changes)',
    handler: (args) => `Setting alert for: "${args}"...`,
  },
  HOT: {
    desc: 'Show trending AP topics right now',
    handler: () => 'Loading trending topics...',
  },
};

export function useCommand() {
  const { addCommandToHistory, addMessage, setCurrentView } = useTerminalStore();

  const getAvailableCommands = useCallback(() => {
    return Object.entries(COMMANDS).map(([cmd, { desc }]) => ({
      command: cmd,
      description: desc,
    }));
  }, []);

  const parseCommand = useCallback(
    (input: string): { command: string; args: string } | null => {
      const trimmed = input.trim();
      if (!trimmed) return null;

      const parts = trimmed.split(/\s+/);
      const command = parts[0].toUpperCase();
      const args = parts.slice(1).join(' ');

      if (command === 'CLEAR') {
        addMessage('\n--- cleared ---\n');
        return null;
      }

      if (command === 'DASH') {
        setCurrentView('dashboard');
      }

      return { command, args };
    },
    [addMessage, setCurrentView]
  );

  const getCommandHelp = useCallback((cmd: string): string | null => {
    const entry = COMMANDS[cmd.toUpperCase()];
    if (!entry) return null;
    return entry.desc;
  }, []);

  const validateCommand = useCallback((cmd: string): boolean => {
    return cmd.toUpperCase() in COMMANDS;
  }, []);

  return { parseCommand, getAvailableCommands, getCommandHelp, validateCommand };
}
