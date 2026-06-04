import type {
  GameQueryOptions,
  NormalizedGameSummary
} from '~/types/content'
import { storyblokContentSource } from './storyblok-content-source'

export const resolveGames = async (
  options: GameQueryOptions = {}
): Promise<NormalizedGameSummary[]> => {
  return await storyblokContentSource.getGames(options)
}
