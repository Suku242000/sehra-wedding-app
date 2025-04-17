import concurrently from 'concurrently';
import path from 'path';

// Define colors for different app logs
const colors = ['blue', 'green', 'magenta', 'cyan'];

// Define the apps to run
const apps = [
  {
    name: 'server',
    command: 'NODE_ENV=development tsx server/index.ts',
    prefixColor: colors[0]
  },
  {
    name: 'sehra-client',
    command: 'cd sehra-client && npm run dev',
    prefixColor: colors[1]
  },
  {
    name: 'sehra-internal',
    command: 'cd sehra-internal && npm run dev',
    prefixColor: colors[2]
  }
];

// Run all applications concurrently
concurrently(apps, {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
  restartDelay: 1000,
}).then(
  () => console.log('All processes exited with code 0'),
  (err) => console.error('Error occurred:', err)
);