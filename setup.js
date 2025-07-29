#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌱 Setting up EcoHealth Navigator...\n');

// Check if Node.js is installed
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js detected: ${nodeVersion}`);
} catch (error) {
    console.error('❌ Node.js is not installed. Please install Node.js first.');
    process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
} catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
}

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
    console.log('\n🔧 Creating .env file...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created from .env.example');
}

// Display setup completion message
console.log('\n🎉 Setup complete! Here\'s how to run the demo:\n');
console.log('1. Start the server:');
console.log('   npm start\n');
console.log('2. Open your browser and go to:');
console.log('   http://localhost:3001\n');
console.log('3. Or open the client directly:');
console.log('   Open client/index.html in your browser\n');
console.log('🌟 The demo will show:');
console.log('   • Real-time environmental data');
console.log('   • AI-powered health recommendations');
console.log('   • Community challenges and gamification');
console.log('   • Live updates every 30 seconds\n');
console.log('📹 For the video demo, follow the script in DEMO_SCRIPT.md');
console.log('📚 For technical details, see TECHNICAL_ARCHITECTURE.md\n');
console.log('Happy coding! 🚀');