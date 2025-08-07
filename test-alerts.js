#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ALERT_AGENT = process.env.TELEGRAM_ALERT_AGENT;

console.log('🧪 Teste de Alertas do DashBot\n');

// Verificar se as variáveis estão configuradas
if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN não configurado');
  process.exit(1);
}

if (!TELEGRAM_ALERT_AGENT) {
  console.error('❌ TELEGRAM_ALERT_AGENT não configurado');
  process.exit(1);
}

console.log(`✅ Bot Token configurado (***${TELEGRAM_BOT_TOKEN.slice(-6)})`);
console.log(`✅ Chat de alerta: ${TELEGRAM_ALERT_AGENT}\n`);

async function sendTestAlert(type) {
  const messages = {
    startup: `🚨 *DashBot Startup Failed*\n\n❌ *Error:* Unable to connect to Telegram API\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n\n🔧 *Check:*\n• TELEGRAM_BOT_TOKEN configuration\n• Network connectivity\n• Service permissions\n\n⚠️ *This is a TEST message*`,

    crash: `🚨 *DashBot Crashed*\n\n❌ *Uncaught Exception*\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⚠️ *Error:* Test error simulation\n\n🔧 *Process will restart automatically*\n\n⚠️ *This is a TEST message*`,

    shutdown: `⚠️ *DashBot Shutdown*\n\n🔄 *Signal:* SIGTERM\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⏱ *Uptime:* 45 minutes\n\n🔧 *Process is shutting down gracefully*\n\n⚠️ *This is a TEST message*`,

    simple: `🧪 *DashBot Alert Test*\n\n✅ O sistema de alertas está funcionando!\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n\n Este é um teste manual.`,
  };

  const message = messages[type] || messages.simple;

  try {
    console.log(`📤 Enviando alerta: ${type}`);

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ALERT_AGENT,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log(
      `✅ Alerta enviado com sucesso! Message ID: ${result.message_id}`
    );
    return true;
  } catch (error) {
    console.error(`❌ Falha ao enviar alerta: ${error.message}`);
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log('🚀 Iniciando testes de alerta...\n');

  const tests = ['simple', 'startup', 'crash', 'shutdown'];

  for (const test of tests) {
    console.log(`\n--- Teste: ${test.toUpperCase()} ---`);
    const success = await sendTestAlert(test);

    if (success) {
      console.log('🎉 Teste passou!\n');
      // Esperar 2 segundos entre cada teste
      if (test !== tests[tests.length - 1]) {
        console.log('⏳ Aguardando 2 segundos...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      console.log('💥 Teste falhou!\n');
      break;
    }
  }

  console.log(
    '\n📱 Verifique seu Telegram para confirmar se os alertas chegaram!'
  );
  console.log(`   Chat ID: ${TELEGRAM_ALERT_AGENT}`);
}

runTests().catch(error => {
  console.error('💥 Erro durante os testes:', error);
  process.exit(1);
});
