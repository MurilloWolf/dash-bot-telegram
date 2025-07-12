import { spawn } from 'child_process';
import { execSync } from 'child_process';

console.log('🚀 Iniciando ambiente completo de desenvolvimento...');

// Verificar se o Docker está rodando
try {
  execSync('docker info', { stdio: 'ignore' });
} catch {
  console.error('❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente.');
  process.exit(1);
}

// Função para executar comandos
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Função para verificar se o PostgreSQL está rodando
function checkPostgreSQL() {
  try {
    const result = execSync('docker-compose ps postgres', { encoding: 'utf8' });
    return result.includes('Up');
  } catch {
    return false;
  }
}

async function main() {
  try {
    // Verificar se o PostgreSQL já está rodando
    if (checkPostgreSQL()) {
      console.log('✅ PostgreSQL já está rodando!');
    } else {
      console.log('🐘 Iniciando PostgreSQL...');
      await runCommand('docker-compose up -d postgres');
      
      console.log('⏳ Aguardando PostgreSQL inicializar...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verificar se o PostgreSQL está pronto
      let ready = false;
      while (!ready) {
        try {
          execSync('docker-compose exec postgres pg_isready -U dashbot -d dashbot', { stdio: 'ignore' });
          ready = true;
        } catch {
          console.log('⏳ Aguardando PostgreSQL...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log('✅ PostgreSQL está rodando!');
    }
    
    // Gerar o cliente Prisma
    console.log('🔧 Gerando cliente Prisma...');
    await runCommand('npm run prisma:generate:dev');
    
    // Executar migrações
    console.log('🔄 Executando migrações...');
    await runCommand('npm run prisma:migrate:dev');
    
    // Seed do banco
    console.log('🌱 Populando banco com dados de teste...');
    await runCommand('npm run db:seed:complete');
    
    console.log('🎉 Setup concluído!');
    console.log('');
    console.log('🤖 Iniciando o bot...');
    console.log('');
    console.log('📋 Para parar o bot: Ctrl+C');
    console.log('📋 Para parar PostgreSQL: docker-compose down');
    console.log('');
    
    // Iniciar o bot
    await runCommand('npm run dev');
    
  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
    process.exit(1);
  }
}

main();
