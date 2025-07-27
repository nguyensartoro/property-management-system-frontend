/**
 * Development script to run both frontend and backend
 * Run with: node dev.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const FRONTEND_DIR = __dirname;
const BACKEND_DIR = path.join(__dirname, '..', 'backend');

// Function to start server
function startServer(name, command, args, cwd) {
  console.log(`Starting ${name}...`);
  
  const server = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' }
  });
  
  // Prefix output with server name
  const prefixOutput = (data, prefix, color) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`\x1b[${color}m[${prefix}]\x1b[0m ${line}`);
      }
    });
  };
  
  server.stdout.on('data', (data) => prefixOutput(data, name, name === 'Frontend' ? '36' : '32'));
  server.stderr.on('data', (data) => prefixOutput(data, name, name === 'Frontend' ? '33' : '31'));
  
  server.on('close', (code) => {
    console.log(`\x1b[31m[${name}]\x1b[0m Process exited with code ${code}`);
  });
  
  return server;
}

// Start servers
const frontend = startServer('Frontend', 'npm', ['run', 'dev'], FRONTEND_DIR);
const backend = startServer('Backend', 'npm', ['run', 'dev'], BACKEND_DIR);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  frontend.kill();
  backend.kill();
  process.exit(0);
});

console.log('\x1b[35m%s\x1b[0m', '🚀 Development servers started!');
console.log('\x1b[36m%s\x1b[0m', '➡️ Frontend: http://localhost:5173');
console.log('\x1b[32m%s\x1b[0m', '➡️ Backend: http://localhost:5001');
console.log('\x1b[33m%s\x1b[0m', '⚡ Press Ctrl+C to stop both servers\n'); 