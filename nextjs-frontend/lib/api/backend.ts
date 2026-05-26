import { getApiBaseUrl } from "./client";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthUser = {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role?: "user" | "admin";
  score?: number;
  streak?: number;
};

export type Lesson = {
  _id: string;
  title: string;
  content: string;
  type: "lesson" | "practice";
  scoreReward: number;
  order: number;
  resources?: Array<{
    title: string;
    url: string;
  }>;
  practiceQuestions?: Array<{
    url: string;
    A: string;
    B: string;
    C: string;
    D: string;
    correct: "A" | "B" | "C" | "D";
  }>;
};

export type CreateLessonInput = {
  title: string;
  content: string;
  type: "lesson" | "practice";
  scoreReward?: number;
  order?: number;
  resources?: Array<{
    title: string;
    url: string;
  }>;
  practiceQuestions?: Array<{
    url: string;
    A: string;
    B: string;
    C: string;
    D: string;
    correct: "A" | "B" | "C" | "D";
  }>;
};

export type LearningHistoryItem = {
  _id: string;
  userId: string;
  lessonId: Lesson | string;
  date: string;
};

export type DashboardData = {
  user: AuthUser;
  stats: {
    totalLessonsCompleted: number;
    totalScore: number;
    streak: number;
    recentActivities: number;
  };
  recentLearning: LearningHistoryItem[];
  lessonsToday?: number;
  lessonsYesterday?: number;
  lessonsDayBeforeYesterday?: number;
  totalScore?: number;
  streak?: number;
  lastLearnedDate?: string | null;
};

export type LeaderboardUser = {
  _id: string;
  username: string;
  score: number;
  streak: number;
};

export type UserRankData = {
  rank: number;
  totalUsers: number;
  user: LeaderboardUser;
};

export type DictionaryVideo = {
  title: string;
  url: string;
};

export type TranslatorWord = {
  _id: string;
  id?: string;
  title: string;
  text?: string;
  videoUrl?: string;
  videos?: Array<{
    _id?: string;
    id?: string;
    title: string;
    url: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedWords = {
  words: TranslatorWord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
};

export type DictionaryEntries = {
  query: string;
  count: number;
  words: DictionaryVideo[];
};

export type SignVideoItem = {
  id: string;
  url: string;
  group: string;
  name: string;
};

const TOKEN_STORAGE_KEY = "auth_token";
const AUTH_STATE_CHANGED_EVENT = "auth-state-changed";
const PROFILE_CACHE_STORAGE_KEY = "auth_profile_cache";
const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;
const SIGN_VIDEO_CACHE_STORAGE_KEY = "sign_video_cache_v1";
const SIGN_VIDEO_CACHE_TTL_MS = 10 * 60 * 1000;

type ProfileCachePayload = {
  token: string;
  cachedAt: number;
  profile: AuthUser;
};

let profileCache: ProfileCachePayload | null = null;
let signVideoCache: Record<string, { cachedAt: number; data: SignVideoItem[] }> | null = null;

function clearProfileCache(): void {
  profileCache = null;
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_CACHE_STORAGE_KEY);
}

function setProfileCache(token: string, profile: AuthUser): void {
  const payload: ProfileCachePayload = {
    token,
    cachedAt: Date.now(),
    profile,
  };
  profileCache = payload;

  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_CACHE_STORAGE_KEY, JSON.stringify(payload));
}

function getProfileCache(token: string): AuthUser | null {
  const now = Date.now();

  if (profileCache) {
    const valid =
      profileCache.token === token && now - profileCache.cachedAt <= PROFILE_CACHE_TTL_MS;
    if (valid) {
      return profileCache.profile;
    }
  }

  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(PROFILE_CACHE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ProfileCachePayload;
    const valid = parsed.token === token && now - parsed.cachedAt <= PROFILE_CACHE_TTL_MS;
    if (!valid) {
      window.localStorage.removeItem(PROFILE_CACHE_STORAGE_KEY);
      return null;
    }

    profileCache = parsed;
    return parsed.profile;
  } catch {
    window.localStorage.removeItem(PROFILE_CACHE_STORAGE_KEY);
    return null;
  }
}

function loadSignVideoCache(): Record<string, { cachedAt: number; data: SignVideoItem[] }> {
  if (signVideoCache) {
    return signVideoCache;
  }

  if (typeof window === "undefined") {
    signVideoCache = {};
    return signVideoCache;
  }

  const raw = window.localStorage.getItem(SIGN_VIDEO_CACHE_STORAGE_KEY);
  if (!raw) {
    signVideoCache = {};
    return signVideoCache;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, { cachedAt: number; data: SignVideoItem[] }>;
    signVideoCache = parsed && typeof parsed === "object" ? parsed : {};
    return signVideoCache;
  } catch {
    signVideoCache = {};
    window.localStorage.removeItem(SIGN_VIDEO_CACHE_STORAGE_KEY);
    return signVideoCache;
  }
}

function persistSignVideoCache(cache: Record<string, { cachedAt: number; data: SignVideoItem[] }>): void {
  signVideoCache = cache;
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIGN_VIDEO_CACHE_STORAGE_KEY, JSON.stringify(cache));
}

function getCachedSignVideos(cacheKey: string): SignVideoItem[] | null {
  const cache = loadSignVideoCache();
  const entry = cache[cacheKey];
  if (!entry) return null;

  const expired = Date.now() - entry.cachedAt > SIGN_VIDEO_CACHE_TTL_MS;
  if (expired) {
    delete cache[cacheKey];
    persistSignVideoCache(cache);
    return null;
  }

  return entry.data;
}

function setCachedSignVideos(cacheKey: string, data: SignVideoItem[]): void {
  const cache = loadSignVideoCache();
  cache[cacheKey] = {
    cachedAt: Date.now(),
    data,
  };
  persistSignVideoCache(cache);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  clearProfileCache();
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  clearProfileCache();
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  options?: { auth?: boolean },
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  if (options?.auth) {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Bạn chưa đăng nhập.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json()) as ApiEnvelope<T> | { message?: string };

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload as ApiEnvelope<T>;
}

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}): Promise<{ user: AuthUser; token: string }> {
  const response = await requestApi<{ user: AuthUser; token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; token: string }> {
  const response = await requestApi<{ user: AuthUser; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function getProfile(): Promise<AuthUser> {
  const token = getStoredToken();
  if (token) {
    const cachedProfile = getProfileCache(token);
    if (cachedProfile) {
      return cachedProfile;
    }
  }

  const response = await requestApi<AuthUser>("/api/auth/profile", { method: "GET" }, { auth: true });
  if (token) {
    setProfileCache(token, response.data);
  }
  return response.data;
}

export async function getUsers(): Promise<AuthUser[]> {
  const response = await requestApi<AuthUser[]>("/api/auth/users", { method: "GET" }, { auth: true });
  return response.data;
}

export async function deleteUser(userId: string): Promise<AuthUser> {
  const response = await requestApi<AuthUser>(`/api/auth/users/${encodeURIComponent(userId)}`, { method: "DELETE" }, { auth: true });
  return response.data;
}

export async function getLessons(type?: "lesson" | "practice"): Promise<Lesson[]> {
  const query = type ? `?type=${type}` : "";
  const response = await requestApi<Lesson[]>(`/api/learn/lessons${query}`, { method: "GET" });
  return response.data;
}

export async function getLessonById(lessonId: string): Promise<Lesson> {
  const response = await requestApi<Lesson>(`/api/learn/lessons/${lessonId}`, { method: "GET" });
  return response.data;
}

export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  const response = await requestApi<Lesson>(
    "/api/learn/lessons",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { auth: true },
  );
  return response.data;
}

export async function completeLesson(lessonId: string): Promise<{ user: AuthUser; history: LearningHistoryItem }> {
  const response = await requestApi<{ user: AuthUser; history: LearningHistoryItem }>(
    "/api/learn/complete",
    {
      method: "POST",
      body: JSON.stringify({ lessonId }),
    },
    { auth: true },
  );
  return response.data;
}

export async function getLearningHistory(): Promise<LearningHistoryItem[]> {
  const response = await requestApi<LearningHistoryItem[]>("/api/learn/history", { method: "GET" }, { auth: true });
  return response.data;
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await requestApi<DashboardData>("/api/dashboard", { method: "GET" }, { auth: true });
  return response.data;
}

export async function getLeaderboardTop10(): Promise<LeaderboardUser[]> {
  const response = await requestApi<LeaderboardUser[]>("/api/leaderboard/top10", { method: "GET" });
  return response.data;
}

export async function getMyRank(): Promise<UserRankData> {
  const response = await requestApi<UserRankData>("/api/leaderboard/rank", { method: "GET" }, { auth: true });
  return response.data;
}

export async function addTranslatorWord(input: {
  text: string;
  videoUrl?: string;
  videos?: Array<{ title: string; url: string }>;
}): Promise<TranslatorWord> {
  const response = await requestApi<TranslatorWord>("/api/translator/words", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function getTranslatorWords(page = 1, limit = 20): Promise<PaginatedWords> {
  const response = await requestApi<PaginatedWords>(
    `/api/translator/words?page=${page}&limit=${limit}`,
    { method: "GET" },
  );
  return response.data;
}

export async function searchTranslatorWords(search: string): Promise<TranslatorWord[]> {
  const response = await requestApi<TranslatorWord[]>(
    `/api/translator/search?search=${encodeURIComponent(search)}`,
    { method: "GET" },
  );
  return response.data;
}

export async function getTranslatorWordById(wordId: string): Promise<TranslatorWord> {
  const response = await requestApi<TranslatorWord>(`/api/translator/words/${wordId}`, { method: "GET" });
  return response.data;
}

export async function getDictionaryEntries(query = "", limit = 30): Promise<DictionaryEntries> {
  const response = await requestApi<DictionaryEntries>(
    `/api/translator/dictionary?q=${encodeURIComponent(query)}&limit=${limit}`,
    { method: "GET" },
  );
  return response.data;
}

export async function getNumberSignVideos(number?: string | number): Promise<SignVideoItem[]> {
  const suffix = number !== undefined && number !== null && String(number).trim() !== ""
    ? `/api/videos/numbers/${encodeURIComponent(String(number))}`
    : "/api/videos/numbers";

  const cached = getCachedSignVideos(suffix);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${getApiBaseUrl()}${suffix}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  const result = Array.isArray(payload) ? (payload as SignVideoItem[]) : [];
  setCachedSignVideos(suffix, result);
  return result;
}

export async function getAlphabetSignVideos(letter: string): Promise<SignVideoItem[]> {
  const suffix = `/api/videos/alphabet/${encodeURIComponent(letter)}`;
  const cached = getCachedSignVideos(suffix);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${getApiBaseUrl()}${suffix}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  const result = Array.isArray(payload) ? (payload as SignVideoItem[]) : [];
  setCachedSignVideos(suffix, result);
  return result;
}
