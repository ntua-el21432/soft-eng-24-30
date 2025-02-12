import { spawnSync } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';

// ✅ Load test commands from the shell script file
const testFilePath = './tests.sh'; // Ensure this file exists
const testCommands = fs.readFileSync(testFilePath, 'utf-8').split('\n').filter(line => line.trim() !== '');

// ✅ Expected exit codes for different cases
const expectedExitCodes = {
  'healthcheck': 0,
  'resetpasses': 0,
  'resetstations': 0,
  'admin --addpasses': 0,
  'tollstationpasses': 0,
  'passanalysis': 0,
  'passescost': 0,
  'chargesby': 0,
  'logout': 0,
  'login': 0,
  'errorparam': 400, // Invalid command should return 400
};

// ✅ Run each test case
testCommands.forEach((testCmd, index) => {
  const commandParts = testCmd.trim().split(/\s+/); // Split by spaces
  const commandName = commandParts[1] || ''; // Get main command
  const expectedExitCode = Object.keys(expectedExitCodes).find(cmd => commandName.startsWith(cmd))
    ? expectedExitCodes[commandName]
    : 0; // Default 0 if not found

  console.log(chalk.blue(`🔹 Running Test ${index + 1}: ${testCmd}`));

  const result = spawnSync('node', ['./cli.js', ...commandParts.slice(1)], { encoding: 'utf-8' });

  // ✅ Check for warnings in format errors
  if (testCmd.includes('--format YYY')) {
    if (result.stderr.includes('⚠️ Warning: Unsupported format')) {
      console.log(chalk.yellow('✔️ Warning detected for incorrect format (expected).'));
    } else {
      console.log(chalk.red('❌ Warning NOT detected for incorrect format.'));
    }
  }

  // ✅ Check exit code
  if (result.status === expectedExitCode) {
    console.log(chalk.green(`✔️ Passed (Exit Code: ${result.status})`));
  } else {
    console.log(chalk.red(`❌ Failed (Exit Code: ${result.status}, Expected: ${expectedExitCode})`));
    console.log('Output:', result.stdout);
    console.log('Error:', result.stderr);
  }

  console.log('-------------------------------------\n');
});
