#!/usr/bin/env node

import dotenv from 'dotenv';

console.log('🧪 Testando Alertas por Ambiente\n');

// Teste 1: Development (não deve enviar alertas)
console.log('📋 Teste 1: NODE_ENV=development');
dotenv.config({ path: '.env.development', override: true });

if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Ambiente development detectado - alertas desabilitados');
} else {
  console.log('❌ Erro: ambiente não foi configurado corretamente');
}

// Teste 2: Production (deve enviar alertas)
console.log('\n📋 Teste 2: NODE_ENV=production');
dotenv.config({ path: '.env.production.local', override: true });

if (process.env.NODE_ENV === 'production') {
  console.log('✅ Ambiente production detectado - alertas habilitados');

  // Enviar um alerta de teste
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ALERT_AGENT) {
    console.log('📤 Enviando alerta de teste em produção...');

    const message = `🧪 *DashBot Production Test*\n\n✅ *Status:* Alert system active in production\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n🌍 *Environment:* ${process.env.NODE_ENV}\n\n⚠️ *This is a production environment test*`;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_ALERT_AGENT,
            text: message,
            parse_mode: 'Markdown',
          }),
        }
      );

      if (response.ok) {
        console.log('✅ Alerta de produção enviado com sucesso!');
      } else {
        console.log('❌ Falha ao enviar alerta de produção');
      }
    } catch (error) {
      console.log('❌ Erro ao enviar alerta:', error.message);
    }
  }
} else {
  console.log('❌ Erro: ambiente production não foi configurado corretamente');
}

console.log('\n🎉 Teste de ambiente concluído!');
console.log('📱 Você deve ter recebido apenas 1 mensagem (teste de produção)');
