#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import mysql from 'mysql2/promise';
import FormData from 'form-data';
import bcrypt from 'bcrypt';

dotenv.config();
const program = new Command();

// Load environment variables
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:9115/api';
const DEFAULT_FORMAT = process.env.DEFAULT_FORMAT?.toLowerCase() || 'csv'; // Ensure lowercase for consistency

program
  .name('se2430')
  .description('CLI for Toll Manager')
  .version('1.0.0');

// Helper function to get format (defaulting to ENV format)
const getFormat = (optionFormat) => optionFormat || DEFAULT_FORMAT;

// ✅ Database Connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "tollmanager",
});

// 🚦 1️⃣ Command: Retrieve pass data per toll station
program
  .command('tollstationpasses')
  .description('Retrieve pass data for a toll station')
  .option('--station <stationID>', 'Station ID (e.g., NAO01)')
  .option('--from <dateFrom>', 'Start date (YYYYMMDD)')
  .option('--to <dateTo>', 'End date (YYYYMMDD)')
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`)
  .action(async (options) => {
    const format = getFormat(options.format);
    try {
      const response = await axios.get(
        `${BASE_URL}/tollStationPasses/${options.station}/${options.from}/${options.to}?format=${format}`
      );
      console.log(chalk.greenBright(`Pass Data (${format.toUpperCase()} Format):`), response.data);
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
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`)
  .action(async (options) => {
    const format = getFormat(options.format);
    try {
      const response = await axios.get(
        `${BASE_URL}/passAnalysis/${options.stationop}/${options.tagop}/${options.from}/${options.to}?format=${format}`
      );
      console.log(chalk.greenBright(`Pass Analysis (${format.toUpperCase()} Format):`), response.data);
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
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`)
  .action(async (options) => {
    const format = getFormat(options.format);
    try {
      const response = await axios.get(
        `${BASE_URL}/passesCost/${options.stationop}/${options.tagop}/${options.from}/${options.to}?format=${format}`
      );
      console.log(chalk.greenBright(`Pass Cost Data (${format.toUpperCase()} Format):`), response.data);
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
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`)
  .action(async (options) => {
    const format = getFormat(options.format);
    try {
      const response = await axios.get(
        `${BASE_URL}/chargesBy/${options.opid}/${options.from}/${options.to}?format=${format}`
      );
      console.log(chalk.greenBright(`Charges Data (${format.toUpperCase()} Format):`), response.data);
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
  .option('--format <format>', `Output format (json/csv), default: ${DEFAULT_FORMAT}`)
  .action(async (options) => {
    const format = getFormat(options.format);
    try {
      const response = await axios.get(
        `${BASE_URL}/netCharges/${options.tollop1}/${options.tollop2}/${options.from}/${options.to}?format=${format}`
      );
      console.log(chalk.greenBright(`Net Charges (${format.toUpperCase()} Format):`), response.data);
    } catch (error) {
      console.error(chalk.red('Error fetching net charges:'), error.message);
    }
  });

// 🚦 6️⃣ Command: Reset Passes
program
  .command('resetpasses')
  .description('Reset passes and vehicle tags in the system')
  .action(async () => {
    try {
      console.log(chalk.yellow('🗑️ Resetting passes and vehicle tags...'));

      const response = await axios.post(`${BASE_URL}/admin/resetpasses`);

      console.log(chalk.greenBright(`✅ ${response.data.message}`));
    } catch (error) {
      console.error(chalk.red('❌ Error resetting passes:'), error.response?.data || error.message);
    }
  });

// 🚦 7️⃣ Command: Reset Toll Stations & Companies
program
  .command('resetstations')
  .description('Reset toll stations and companies in the system')
  .action(async () => {
    try {
      console.log(chalk.yellow('🔄 Resetting all toll stations and companies...'));

      const response = await axios.post(`${BASE_URL}/admin/resetstations`);

      console.log(chalk.greenBright(`✅ Toll stations and companies reset successfully!`));
    } catch (error) {
      console.error(chalk.red('❌ Error resetting toll stations:'), error.response?.data || error.message);
    }
  });

// 🚦 6️⃣ Command: Health Check
program
  .command('healthcheck')
  .description('Check database health status')
  .action(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/healthcheck`);
      console.log(chalk.greenBright("✅ Health Check Result:"), response.data);
    } catch (error) {
      console.error(chalk.red("❌ Health Check Failed:"), error.message);
    }
  });

  // 🚦 Command: User Login
program
.command('login')
.description('Login to the Toll Manager system')
.option('--username <username>', 'Username for authentication')
.option('--passw <password>', 'Password for authentication')
.action(async (options) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      username: options.username,
      password: options.passw
    });

    const token = response.data.token;
    fs.writeFileSync('auth_token.txt', token);
    console.log(chalk.greenBright('✅ Login successful! Token stored.'));
  } catch (error) {
    console.error(chalk.red('❌ Login failed:'), error.response?.data || error.message);
  }
});

// 🚦 Command: User Logout
program
.command('logout')
.description('Logout from the Toll Manager system')
.action(() => {
  if (fs.existsSync('auth_token.txt')) {
    fs.unlinkSync('auth_token.txt');
    console.log(chalk.yellow('🚪 Logged out successfully! Token removed.'));
  } else {
    console.log(chalk.red('⚠️ No active session found.'));
  }
});

// 🚦 Admin Command: Parent Command
const admin = program.command("admin").description("Admin commands for toll management");

// 📌 **Subcommand: Create User (`usermod`)**
admin
  .command("usermod")
  .description("Create a new user")
  .option("--username <username>", "Username for the new user")
  .option("--passw <password>", "Password for the new user")
  .action(async (options) => {
    if (!options.username || !options.passw) {
      console.error(chalk.red("❌ Error: Username and password are required."));
      process.exit(1);
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(options.passw, 10);

      // Insert new user directly into MySQL
      const [result] = await db.query(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        [options.username, hashedPassword]
      );

      console.log(chalk.greenBright(`✅ User '${options.username}' created successfully (ID: ${result.insertId})`));
      process.exit(0);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        console.error(chalk.red("❌ Error: Username already exists."));
      } else {
        console.error(chalk.red("❌ Database Error:"), error);
      }
      process.exit(1);
    }
  });

// 📌 **Subcommand: Import Passes (`addpasses`)**
admin
  .command("addpasses")
  .description("Import passes from a CSV file")
  .option("--source <filePath>", "Path to the passes CSV file (default: ./passes-sample.csv)", "./passes-sample.csv")
  .option("--format <format>", "Output format (json/csv)", process.env.DEFAULT_FORMAT || "json")
  .action(async (options) => {
    try {
      console.log(chalk.blueBright(`🚀 Importing passes from: ${options.source}...`));

      const formData = new FormData();
      formData.append("file", fs.createReadStream(options.source));

      const response = await axios.post(`${BASE_URL}/admin/addpasses?format=${options.format}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (options.format === "csv") {
        console.log(chalk.greenBright("✅ Passes imported successfully. CSV Output:"));
        console.log(response.data);
      } else {
        console.log(chalk.greenBright("✅ Passes imported successfully."));
        console.table(response.data.data);
      }
    } catch (error) {
      console.error(chalk.red("❌ Error importing passes:"), error.message);
    }
  });

program.parse(process.argv);