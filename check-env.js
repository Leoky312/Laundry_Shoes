const { execSync } = require('child_process');
const net = require('net');

console.log('==================================================');
console.log('🔍 LAUNDRY SHOES APP - ENVIRONMENT HEALTH CHECK');
console.log('==================================================\n');

function checkCommand(command, name) {
  try {
    const stdout = execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    console.log(`✅ ${name}: Terinstal (${stdout.split('\n')[0]})`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: TIDAK DITEMUKAN / BELUM TERINSTAL`);
    return false;
  }
}

// 1. Check Node.js
checkCommand('node -v', 'Node.js');

// 2. Check npm (Windows fallback to npm.cmd)
checkCommand('npm.cmd -v', 'NPM (Node Package Manager)');

// 3. Check Git
checkCommand('git --version', 'Git Version Control');

// 4. Check MySQL Port (Default: 3306)
console.log('\nMemeriksa status service MySQL (Port 3306)...');
const socket = new net.Socket();
socket.setTimeout(2000);

socket.on('connect', () => {
  console.log('✅ MySQL Server: AKTIF & TERHUBUNG di localhost:3306');
  socket.destroy();
  printSummary();
});

socket.on('timeout', () => {
  console.log('⚠️  MySQL Server: TIMEOUT (Pastikan Laragon / XAMPP sudah di-START)');
  socket.destroy();
  printSummary();
});

socket.on('error', (err) => {
  console.log('❌ MySQL Server: TIDAK AKTIF di port 3306');
  console.log('   👉 Tip: Buka Laragon atau XAMPP, lalu klik tombol "Start All"');
  printSummary();
});

socket.connect(3306, '127.0.0.1');

function printSummary() {
  console.log('\n==================================================');
  console.log('📋 CATATAN PERSIAPAN:');
  console.log('1. Pastikan Laragon/XAMPP dalam status "Start"');
  console.log('2. Di HP Android/iOS, install aplikasi "Expo Go" dari Play Store / App Store');
  console.log('3. Langkah berikutnya adalah inisialisasi Database MySQL & Backend Node.js');
  console.log('==================================================\n');
}
