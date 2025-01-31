#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const program = new Command();

// Load environment variables
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:9115/api';
const DEFAULT_FORMAT = process.env.DEFAULT_FORMAT || 'json';

program
  .name('se2430')
  .description('CLI for Toll Manager')
  .version('1.0.0');

// 🚦 1️⃣ Command: Retrieve pass data per toll station
program
  .command('tollstationpasses')
  .description('Retrieve pass data for a toll station')
  .option('--station <stationID>', 'Station ID (e.g., NAO01)')
  .option('--from <dateFrom>', 'Start date (YYYYMMDD)')
  .option('--to <dateTo>', 'End date (YYYYMMDD)')
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`, DEFAULT_FORMAT)
  .action(async (options) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/tollStationPasses/${options.station}/${options.from}/${options.to}?format=${options.format}`
      );
      console.log(chalk.greenBright(`Pass Data (${options.format.toUpperCase()} Format):`), response.data);
    } catch (error) {
      console.error(chalk.red('Error fetching pass data:'), error.message);
    }
  });

// 🚦 2️⃣ Command: Analyze passes between two operators
program
  .command('passanalysis')
  .description('Analyze passes between two operators')
  .option('--stationop <op1>', 'Operator ID 1 (e.g., KO)')
  .option('--tagop <op2>', 'Operator ID 2 (e.g., AM)')
  .option('--from <dateFrom>', 'Start date (YYYYMMDD)')
  .option('--to <dateTo>', 'End date (YYYYMMDD)')
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`, DEFAULT_FORMAT)
  .action(async (options) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/passAnalysis/${options.stationop}/${options.tagop}/${options.from}/${options.to}?format=${options.format}`
      );
      console.log(chalk.greenBright(`Pass Analysis (${options.format.toUpperCase()} Format):`), response.data);
    } catch (error) {
      console.error(chalk.red('Error analyzing passes:'), error.message);
    }
  });

// 🚦 3️⃣ Command: Get pass cost between two operators
program
  .command('passescost')
  .description('Retrieve pass cost data between two operators')
  .option('--stationop <op1>', 'Operator ID 1 (e.g., KO)')
  .option('--tagop <op2>', 'Operator ID 2 (e.g., AM)')
  .option('--from <dateFrom>', 'Start date (YYYYMMDD)')
  .option('--to <dateTo>', 'End date (YYYYMMDD)')
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`, DEFAULT_FORMAT)
  .action(async (options) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/passesCost/${options.stationop}/${options.tagop}/${options.from}/${options.to}?format=${options.format}`
      );
      console.log(chalk.greenBright(`Pass Cost Data (${options.format.toUpperCase()} Format):`), response.data);
    } catch (error) {
      console.error(chalk.red('Error fetching pass cost data:'), error.message);
    }
  });

// 🚦 4️⃣ Command: Get passes from vehicles of other operators
program
  .command('chargesby')
  .description('Retrieve pass data for vehicles of other operators')
  .option('--opid <op>', 'Operator ID (e.g., AM)')
  .option('--from <dateFrom>', 'Start date (YYYYMMDD)')
  .option('--to <dateTo>', 'End date (YYYYMMDD)')
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`, DEFAULT_FORMAT)
  .action(async (options) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/chargesBy/${options.opid}/${options.from}/${options.to}?format=${options.format}`
      );
      console.log(chalk.greenBright(`Charges Data (${options.format.toUpperCase()} Format):`), response.data);
    } catch (error) {
      console.error(chalk.red('Error fetching charge data:'), error.message);
    }
  });

// 🚦 5️⃣ Command: Get net charges between two toll operators
program
  .command('netcharges')
  .description('Retrieve net charges between two toll operators')
  .option('--tollop1 <op1>', 'The requesting Toll Operator ID (e.g., KO)')
  .option('--tollop2 <op2>', 'The requestee Toll Operator ID (e.g., AM)')
  .option('--from <dateFrom>', 'Start date (YYYYMMDD)')
  .option('--to <dateTo>', 'End date (YYYYMMDD)')
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`, DEFAULT_FORMAT)
  .action(async (options) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/netCharges/${options.tollop1}/${options.tollop2}/${options.from}/${options.to}?format=${options.format}`
      );
      console.log(chalk.greenBright(`Net Charges (${options.format.toUpperCase()} Format):`), response.data);
    } catch (error) {
      console.error(chalk.red('Error fetching net charges:'), error.message);
    }
  });

program.parse(process.argv);