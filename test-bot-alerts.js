#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

console.log('🧪 Testando Sistema de Alertas do Bot\n');

// Simular diferentes tipos de problemas
const testScenarios = {
  crash: () => {
    console.log('💥 Simulando crash (uncaught exception)...');
    setTimeout(() => {
      throw new Error('Simulated crash for testing alerts');
    }, 2000);
  },

  rejection: () => {
    console.log('⚠️ Simulando unhandled promise rejection...');
    setTimeout(() => {
      Promise.reject(new Error('Simulated promise rejection for testing'));
    }, 2000);
  },

  shutdown: () => {
    console.log('🛑 Simulando graceful shutdown (SIGTERM)...');
    setTimeout(() => {
      process.kill(process.pid, 'SIGTERM');
    }, 2000);
  },

  startup: () => {
    console.log('🚀 Testando alerta de inicialização...');
    // Simular que o bot iniciou com sucesso
    const startupMessage = `✅ *DashBot Started Successfully (TEST)*\n\n🚀 *Status:* Bot is now running\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n🌍 *Environment:* development\n🤖 *Platform:* telegram\n\n📊 *Health monitoring is active*\n\n⚠️ *This is a TEST message*`;

    sendAlert(startupMessage);
  },
};

async function sendAlert(message) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ALERT_AGENT) {
    console.error('❌ Variáveis de ambiente não configuradas');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_ALERT_AGENT,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    if (response.ok) {
      console.log('✅ Alerta enviado com sucesso!');
    } else {
      console.error('❌ Falha ao enviar alerta:', await response.text());
    }
  } catch (error) {
    console.error('❌ Erro ao enviar alerta:', error.message);
  }
}

// Configurar handlers para capturar os alertas
process.on('uncaughtException', async error => {
  console.log('\n🚨 CAPTURADO: Uncaught Exception');

  const crashMessage = `🚨 *DashBot Crashed (TEST)*\n\n❌ *Uncaught Exception*\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⚠️ *Error:* ${error.message}\n\n🔧 *Process will restart automatically*\n\n⚠️ *This is a TEST simulation*`;

  await sendAlert(crashMessage);

  setTimeout(() => {
    console.log('✅ Teste de crash concluído!');
    process.exit(1);
  }, 2000);
});

process.on('unhandledRejection', async reason => {
  console.log('\n⚠️ CAPTURADO: Unhandled Promise Rejection');

  const rejectionMessage = `⚠️ *DashBot Promise Rejection (TEST)*\n\n❌ *Unhandled Rejection*\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⚠️ *Reason:* ${String(reason)}\n\n🔧 *Process continues running*\n\n⚠️ *This is a TEST simulation*`;

  await sendAlert(rejectionMessage);

  setTimeout(() => {
    console.log('✅ Teste de promise rejection concluído!');
    process.exit(0);
  }, 2000);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 CAPTURADO: SIGTERM (Graceful Shutdown)');

  const shutdownMessage = `⚠️ *DashBot Shutdown (TEST)*\n\n🔄 *Signal:* SIGTERM\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⏱ *Uptime:* ${Math.floor(process.uptime())} seconds\n\n🔧 *Process is shutting down gracefully*\n\n⚠️ *This is a TEST simulation*`;

  await sendAlert(shutdownMessage);

  setTimeout(() => {
    console.log('✅ Teste de shutdown concluído!');
    process.exit(0);
  }, 2000);
});

// Menu de testes
const scenario = process.argv[2];

if (!scenario || !testScenarios[scenario]) {
  console.log('📋 Cenários disponíveis:');
  console.log(
    '  node test-bot-alerts.js startup   - Testa alerta de inicialização'
  );
  console.log('  node test-bot-alerts.js crash     - Testa alerta de crash');
  console.log(
    '  node test-bot-alerts.js rejection - Testa alerta de promise rejection'
  );
  console.log('  node test-bot-alerts.js shutdown  - Testa alerta de shutdown');
  process.exit(0);
}

console.log(`🎯 Executando cenário: ${scenario.toUpperCase()}\n`);
testScenarios[scenario]();
