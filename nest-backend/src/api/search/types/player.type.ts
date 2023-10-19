import { PlayerSearch } from "../entities/player.search.entity";

export type PlayerSearchWithTierName = Omit<PlayerSearch, 'tier'> & { tier: string };

export type PlayerSearchOutput = Omit<PlayerSearchWithTierName, 'id' | 'isRSOed' | 'createdAt' | 'updatedAt' | 'regionId'>;