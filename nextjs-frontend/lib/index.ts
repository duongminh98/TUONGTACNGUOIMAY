/* lib/ directory barrel file for convenient imports */

/* API and Client Configuration */
export {
  getApiBaseUrl,
  getMlApiBaseUrl,
  initializeApiClient,
  predictSignToText,
  translateTextToSign,
} from "./api";

/* Utilities */
export { cn } from "./utils/cn";
export { capitalize, toKebabCase, toCamelCase } from "./utils/string";
export { formatDate, formatTime, formatISO } from "./utils/date";

/* Types */
export type {
  SignToTextResult,
  SignToTextResponse,
  TextToSignResult,
  TextToSignResponse,
  HolisticLandmark,
  HolisticResult,
  NormalizedLandmark,
  HolisticDrawResults,
  LandmarkPoint,
} from "./types";

/* Constants */
export {
  API_ENDPOINTS,
  ENV_VARS,
  SIGN_SEQUENCE_LENGTH,
  SIGN_FEATURE_SIZE,
  POSE_CONNECTIONS,
  HAND_CONNECTIONS,
  FACE_DOT,
  POSE,
  LEFT_HAND,
  RIGHT_HAND,
  PROB_BAR_PALETTE,
  LEGACY_SEQUENCE_COLLECTION_WORDS,
} from "./constants";
export type { LegacySequenceWord } from "./constants";

/* MediaPipe Processing and Drawing */
export { extractHolisticKeypoints, drawHolisticLandmarks, drawProbabilityBars, drawDetectedLabel } from "./mediapipe";
