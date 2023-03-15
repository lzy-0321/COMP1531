import { resetData } from './dataStore';

/**
 * Resets the internal data of the application to its initial state
 *
 * @returns {} - success
 */
export const clearV1 = () => {
  resetData();

  return {};
};
