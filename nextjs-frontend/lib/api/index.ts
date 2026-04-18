/* API layer barrel file - export all API functions */
export { getApiBaseUrl, getMlApiBaseUrl, initializeApiClient } from "./client";
export { predictSignToText, translateTextToSign } from "./sign-translation";
export {
  addTranslatorWord,
  clearStoredToken,
  completeLesson,
  getDictionaryEntries,
  getDashboard,
  getAlphabetSignVideos,
  getLeaderboardTop10,
  getLearningHistory,
  getLessonById,
  getLessons,
  getMyRank,
  getProfile,
  getNumberSignVideos,
  getUsers,
  getStoredToken,
  getTranslatorWordById,
  getTranslatorWords,
  loginUser,
  registerUser,
  searchTranslatorWords,
  setStoredToken,
} from "./backend";
