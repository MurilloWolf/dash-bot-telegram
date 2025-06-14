// const token = process.env.TELEGRAM_BOT_TOKEN; // Replace with your own bot token
// config dotenv
const dotenv = require("dotenv");
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(token, { polling: true });

const cach = () => {
  let raceCache = null;
  let lastFetchTime = null;
  const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

  async function getCorridas() {
    const now = Date.now();

    // Se não tem cache ou ele expirou, busca de novo
    if (!raceCache || now - lastFetchTime > CACHE_DURATION_MS) {
      try {
        const response = await axios.get("https://suaapi.com/api/corridas");
        raceCache = response.data;
        lastFetchTime = now;
      } catch (error) {
        console.error("Erro ao buscar corridas:", error);
        return []; // ou retorna o último cache mesmo se quiser
      }
    }

    return raceCache;
  }
};

const isRaceOpening = (race) => {
  const today = new Date();
  const runningDate = new Date(race.date);
  const isOpen = runningDate >= today;
  return isOpen;
};

const fetchRaces = async () => {};

const findNextRace = (race) => {
  const today = new Date();
  const runningDate = new Date(race.date);
  const isNext = runningDate > today;
  return isNext;
};

const getStatusEmoji = (status) => {
  switch (status) {
    case "open":
      return "🔓 Aberto";
    case "closed":
      return "🔒 Fechado";
    case "coming_soon":
      return "⏳ Em breve";
    default:
      return "";
  }
};

const getDistances = (distances) => {
  if (distances.length === 0) {
    return "❌ Distâncias não informadas";
  }

  const formattedDistances = distances
    .map((distance) => `🏃‍♂️ ${distance}`)
    .join("\t");
  return `📏 Distâncias:\n ${formattedDistances}`;
};

const formatDateBR = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatRunningMessage = (race) => {
  const tittle = `🏃‍♂️ *${race.title}*`;
  const organization = `_${race.organization}_`;
  const distances = getDistances(race.distances);
  const date = `📅 ${formatDateBR(race.date)}`;
  const link = `🔗 [Inscrições](${race.link})`;
  const status = getStatusEmoji(race.status);

  const formattedMessage = `${tittle}\n ${organization}\n${date}\n\n ${distances}\n \n ${status}\n${link} `;
  return formattedMessage;
};

const sanitizeInput = (input) => {
  const botName = "@DashRC_bot";

  if (input.includes(botName)) {
    return input.replace(botName, "");
  }

  return input;
};

const commands = {
  "/start": (msg, raceList) => {
    bot.sendMessage(
      msg.chat.id,
      `*👋 Olá ${msg.from.first_name}! Eu sou o bot de corridas*.
       \n - Use /corridas para ver as corridas disponíveis.
       \n - Use /corridas <distâncias>km para filtrar as corridas por distâncias. Exemplo: /corridas 5km.
       \n - Use /help para ver os comandos disponíveis.`,
      { parse_mode: "Markdown" }
    );
  },
  "/corridas": (msg, raceList) => {
    raceList.forEach((race) => {
      const isOpen = isRaceOpening(race);
      console.log("Running:", race.title, "is open:", isOpen);
      if (!isOpen) {
        return;
      }

      const formattedMessage = formatRunningMessage(race);
      bot.sendMessage(msg.chat.id, formattedMessage, {
        parse_mode: "Markdown",
      });
    });
  },
  "/proxima_corrida": (msg, raceList) => {
    const nextRace = raceList.find((race) => findNextRace(race));
    if (nextRace) {
      const formattedMessage = formatRunningMessage(nextRace);
      bot.sendMessage(msg.chat.id, formattedMessage, {
        parse_mode: "Markdown",
      });
    } else {
      bot.sendMessage(
        msg.chat.id,
        `*❌ Nenhuma corrida disponível no momento!*`,
        { parse_mode: "Markdown" }
      );
    }
  },
  "/ajuda": (msg, raceList) => {
    bot.sendMessage(
      msg.chat.id,
      `*🆘 Comandos disponíveis:*\n` +
        `/start\\: Apresentação do bot\n\n` +
        `/corridas\\: Lista de corridas disponíveis\n` +
        `/corridas \\[distâncias\\]km\\: Lista de corridas filtradas por distâncias\\, \nExemplo\\: /corridas 5km\n\n` +
        `/proxima\\_corrida\\: Mostra a próxima corrida disponível\n\n` +
        `/help\\: Lista de comandos disponíveis`,
      { parse_mode: "MarkdownV2" }
    );
  },
};

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Process the incoming message here
  console.log(`Received message: ${messageText} from chat ID: ${chatId}`);
  const sanitizedMessage = sanitizeInput(messageText);

  const commandExists = commands[sanitizedMessage];
  if (commandExists) {
    const raceList = await fetch(process.env.RACES_ENDPOINT)
      .then((res) => res.json())
      .catch((err) => console.error(err));

    commands[sanitizedMessage]?.(msg, raceList || []);
    return;
  }

  const runningDistancesRegex = /^\/corridas (.+)/;
  const runningDistancesMatch = sanitizedMessage.match(runningDistancesRegex);

  if (runningDistancesMatch) {
    const distances = runningDistancesMatch[1].split(",");

    const raceList = await fetch(process.env.RACES_ENDPOINT)
      .then((res) => res.json())
      .catch((err) => console.error(err));

    const filteredRunnings = raceList.filter((running) =>
      running.distances.some((distance) => distances.includes(distance))
    );

    filteredRunnings.forEach((running) => {
      const formattedMessage = formatRunningMessage(running);
      bot.sendMessage(chatId, formattedMessage, { parse_mode: "Markdown" });
    });
  }

  if (!commandExists && !runningDistancesMatch) {
    bot.sendMessage(
      chatId,
      `*❌ Comando inválido!*\nUse /help para ver os comandos disponíveis.`,
      { parse_mode: "Markdown" }
    );
  }
});

bot.on("polling_error", (error) => {
  console.log(error.code);
  console.error(`Polling error: ${error.message}`);
});

/**
 * Command list
 * start - Apresentação do bot
 * corridas - Lista de corridas
 * corridas <distâncias>km - Lista de corridas filtradas por distâncias
 * proxima_corrida - Mostra a proxima corrida
 * help - Lista de comandos disponíveis
 */
