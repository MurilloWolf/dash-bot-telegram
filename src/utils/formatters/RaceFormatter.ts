import { Race, RaceStatus } from '../../types/Service.ts';

export class RaceFormatter {
  static formatRaceMessage(race: Race): string {
    const statusEmoji = this.getStatusEmoji(race.status);
    const distancesText = race.distances.join(' / ');

    return `${statusEmoji} <strong>${race.title}</strong>
📅 <strong>Data:</strong> ${this.formatDate(race.date)}
🕐 <strong>Horário:</strong> ${race.time}
📍 <strong>Local:</strong> ${race.location}
🏃‍♂️ <strong>Distâncias:</strong> ${distancesText}
🏢 <strong>Organização:</strong> ${race.organization}
🔗 <strong>Link:</strong> <a href="${race.link}">Inscrições</a>`;
  }

  static formatDetailedRaceMessage(race: Race): string {
    const statusEmoji = this.getStatusEmoji(race.status);
    const statusText = this.getStatusText(race.status);
    const distancesText = race.distances.join(' / ');

    return `${statusEmoji} <strong>${race.title}</strong>

📅 <strong>Data:</strong> ${this.formatDate(race.date)}
🕐 <strong>Horário:</strong> ${race.time}
📍 <strong>Local:</strong> ${race.location}
🏃‍♂️ <strong>Distâncias:</strong> ${distancesText}
🏢 <strong>Organização:</strong> ${race.organization}
📊 <strong>Status:</strong> ${statusText}

🔗 <strong>Link para inscrições:</strong>
<a href="${race.link}">Clique aqui para se inscrever</a>

💡 <em>Use os botões abaixo para mais opções!</em>`;
  }

  static formatRaceMessages(race: Race): string[] {
    return [this.formatRaceMessage(race)];
  }

  static formatRaceList(races: Race[]): string {
    if (races.length === 0) {
      return '❌ Nenhuma corrida encontrada.';
    }

    const header = `🏃‍♂️ <strong>Corridas Disponíveis</strong> (${races.length})\n\n`;
    const racesList = races
      .map((race, index) => {
        const statusEmoji = this.getStatusEmoji(race.status);
        const distancesText = race.distances.join(' / ');
        return `${index + 1}. ${statusEmoji} <strong>${race.title}</strong>
📅 ${this.formatDate(race.date)} • 🏃‍♂️ ${distancesText}
🏢 ${race.organization}`;
      })
      .join('\n\n');

    return header + racesList;
  }

  private static getStatusEmoji(status: RaceStatus): string {
    switch (status) {
      case RaceStatus.OPEN:
        return '🟢';
      case RaceStatus.CLOSED:
        return '🔴';
      case RaceStatus.COMING_SOON:
        return '🟡';
      case RaceStatus.CANCELLED:
        return '⚫';
      default:
        return '⚪';
    }
  }

  private static getStatusText(status: RaceStatus): string {
    switch (status) {
      case RaceStatus.OPEN:
        return 'Inscrições Abertas';
      case RaceStatus.CLOSED:
        return 'Inscrições Encerradas';
      case RaceStatus.COMING_SOON:
        return 'Em Breve';
      case RaceStatus.CANCELLED:
        return 'Cancelada';
      default:
        return 'Status Desconhecido';
    }
  }

  private static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }
}
