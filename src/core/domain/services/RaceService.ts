import {
  Race,
  RaceFilter,
  RaceStatus,
  RaceStatusValue,
} from '../entities/Race.ts';
import { RaceRepository } from '../repositories/RaceRepository.ts';

export class RaceService {
  constructor(private raceRepository: RaceRepository) {}

  async getAvailableRaces(): Promise<Race[]> {
    return this.raceRepository.findOpenRaces();
  }

  async getRacesByDistances(distances: number[]): Promise<Race[]> {
    return this.raceRepository.findByDistances(distances);
  }
  async getRacesByTitle(title: string): Promise<Race[] | null> {
    return this.raceRepository.findByTitle(title);
  }

  async getRacesByRange(
    startDistance: number,
    endDistance: number
  ): Promise<Race[]> {
    return this.raceRepository.findByRange(startDistance, endDistance);
  }

  async getNextRace(): Promise<Race[] | null> {
    return this.raceRepository.findNextRace();
  }

  async getAllRaces(filter?: RaceFilter): Promise<Race[]> {
    return this.raceRepository.findAll(filter);
  }

  async getRaceById(raceId: string): Promise<Race | null> {
    return this.raceRepository.findById(raceId);
  }

  async createRace(
    raceData: Omit<Race, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Race> {
    return this.raceRepository.create(raceData);
  }

  async updateRaceStatus(
    raceId: string,
    status: RaceStatusValue
  ): Promise<Race> {
    return this.raceRepository.updateStatus(raceId, status);
  }

  async deleteRace(raceId: string): Promise<void> {
    return this.raceRepository.delete(raceId);
  }

  isRaceOpen(race: Race): boolean {
    const today = new Date();
    const raceDate = new Date(race.date);
    return raceDate >= today && race.status === RaceStatus.OPEN;
  }

  formatRaceMessage(race: Race): string {
    const title = `🏃‍♂️ <b>${race.title}</b>`;
    const organization = `<i>${race.organization}</i>`;
    const distances = this.formatDistances(race.distances);
    const date = `📅 ${this.formatDateBR(race.date)}`;
    const linkText = `🔗 <a href="${race.link}">Inscrições</a>`;
    const status = this.getStatusEmoji(race.status);

    return `${title}\n${organization}\n${date}\n\n${distances}\n\n${status}\n${linkText}`;
  }

  formatRaceMessages(races: Race[]): string[] {
    const messages = races.map(race => this.formatRaceMessage(race));
    return messages;
  }

  formatDetailedRaceMessage(race: Race): string {
    const title = `🏃‍♂️ <b>${race.title}</b>`;
    const organization = `<i>${race.organization}</i>`;
    const distances = this.formatDistances(race.distances);
    const date = `📅 ${this.formatDateBR(race.date)}`;
    const time = race.time ? `⏰ ${race.time}` : '';
    const location = race.location ? `📍 <b>Local:</b> ${race.location}` : '';
    const linkText = `🔗 <a href="${race.link}">Inscrições</a>`;
    const status = this.getStatusEmoji(race.status);

    let message = `${title}\n${organization}\n${date}`;
    if (time) {
      message += `\n${time}`;
    }
    if (location) {
      message += `\n${location}`;
    }
    message += `\n\n${distances}\n\n${status}\n${linkText}`;

    return message;
  }

  private formatDistances(distances: string[]): string {
    if (distances.length === 0) {
      return '❌ Distâncias não informadas';
    }

    const formattedDistances = distances
      .map(distance => `🏃‍♂️ ${distance}`)
      .join('\n');
    return `📏 Distâncias:\n${formattedDistances}`;
  }

  private formatDateBR(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case RaceStatus.OPEN:
        return '🔓 Aberto';
      case RaceStatus.CLOSED:
        return '🔒 Fechado';
      case RaceStatus.COMING_SOON:
        return '⏳ Em breve';
      case RaceStatus.CANCELLED:
        return '❌ Cancelado';
      default:
        return '';
    }
  }
}
