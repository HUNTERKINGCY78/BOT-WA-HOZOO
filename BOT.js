const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');
const moment = require('moment-timezone');
const axios = require('axios');

// Inisialisasi koneksi WhatsApp
const conn = new WAConnection();

// Warna console
const colors = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  RESET: '\x1b[0m'
};

// Variabel untuk menyimpan data
let bannedNumbers = new Set();
let unbannedNumbers = new Set();

// Fungsi untuk menampilkan informasi bot
function showBotInfo() {
  console.log(`${colors.CYAN}
=============================================
 WhatsApp Bot Online
 Fitur:
 - .mulai: Memulai bot
 - .phone +62 banned nonor: Cek status banned
 - .jam: Tampilkan waktu saat ini
 - .phone +62 unbanned nomor: Proses unbanned
=============================================
${colors.RESET}`);
}

// Fungsi untuk memulai bot
async function startBot() {
  // Load session jika ada
  conn.loadAuthInfo('./auth_info.json');
  
  conn.on('qr', qr => {
    console.log(`${colors.YELLOW}[!] Scan QR Code ini dengan WhatsApp di perangkat Anda${colors.RESET}`);
    console.log(qr);
  });

  conn.on('credentials-updated', () => {
    const authInfo = conn.base64EncodedAuthInfo();
    fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, 2));
    console.log(`${colors.GREEN}[✓] Credentials updated dan disimpan${colors.RESET}`);
  });

  conn.on('chat-update', async chatUpdate => {
    if (!chatUpdate.hasNewMessage) return;
    const m = chatUpdate.messages.all()[0];
    if (!m.message) return;
    
    const messageText = m.message.conversation || m.message.extendedTextMessage?.text || '';
    const sender = m.key.remoteJid;
    
    // Perintah .mulai
    if (messageText === '.mulai') {
      await conn.sendMessage(sender, 'Bot WhatsApp online dan siap digunakan!', MessageType.text);
    }
    
    // Perintah .phone +62 banned nonor
    else if (messageText.startsWith('.phone +62') && messageText.includes('banned nonor')) {
      const phoneNumber = messageText.split('banned nonor')[0].replace('.phone', '').trim();
      if (bannedNumbers.has(phoneNumber)) {
        await conn.sendMessage(sender, `Nomor ${phoneNumber} terdaftar sebagai BANNED`, MessageType.text);
      } else {
        await conn.sendMessage(sender, `Nomor ${phoneNumber} TIDAK terdaftar sebagai banned`, MessageType.text);
      }
    }
    
    // Perintah .jam
    else if (messageText === '.jam') {
      const now = moment().tz('Asia/Jakarta');
      const timeInfo = `Waktu saat ini:\n${now.format('HH:mm:ss')}\nTanggal: ${now.format('DD-MM-YYYY')}\nBulan: ${now.format('MMMM')}`;
      await conn.sendMessage(sender, timeInfo, MessageType.text);
    }
    
    // Perintah .phone +62 unbanned nomor
    else if (messageText.startsWith('.phone +62') && messageText.includes('unbanned nomor')) {
      const phoneNumber = messageText.split('unbanned nomor')[0].replace('.phone', '').trim();
      
      if (bannedNumbers.has(phoneNumber)) {
        bannedNumbers.delete(phoneNumber);
        unbannedNumbers.add(phoneNumber);
        
        // Proses unbanned (simulasi)
        const success = await processUnban(phoneNumber);
        
        if (success) {
          await conn.sendMessage(sender, `Nomor ${phoneNumber} berhasil di-unbanned`, MessageType.text);
        } else {
          await conn.sendMessage(sender, `Gagal memproses unbanned untuk ${phoneNumber}`, MessageType.text);
        }
      } else {
        await conn.sendMessage(sender, `Nomor ${phoneNumber} tidak terdaftar sebagai banned`, MessageType.text);
      }
    }
  });

  try {
    await conn.connect();
    console.log(`${colors.GREEN}[✓] Bot berhasil terhubung${colors.RESET}`);
    showBotInfo();
  } catch (error) {
    console.error(`${colors.RED}[!] Gagal terhubung: ${error}${colors.RESET}`);
    process.exit(1);
  }
}

// Fungsi untuk memproses unbanned (simulasi)
async function processUnban(phoneNumber) {
  try {
    // Simulasi delay proses
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 80% kemungkinan berhasil
    return Math.random() < 0.8;
  } catch (error) {
    console.error(`${colors.RED}[!] Error dalam proses unbanned: ${error}${colors.RESET}`);
    return false;
  }
}

// Jalankan bot
startBot();
