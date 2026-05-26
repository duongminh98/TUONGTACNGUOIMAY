const logger = require('../../logger');
const Translator = require('../translator/Translator');

const NUMBER_WORD_GROUPS = new Map([
  ['one', '1'],
  ['two', '2'],
  ['three', '3'],
  ['four', '4'],
  ['five', '5'],
  ['six', '6'],
  ['seven', '7'],
  ['eight', '8'],
  ['nine', '9'],
  ['ten', '10'],
  ['eleven', '11'],
  ['twelve', '12'],
  ['thirteen', '13'],
  ['fourteen', '14'],
  ['fifteen', '15'],
  ['sixteen', '16'],
  ['seventeen', '17'],
  ['eighteen', '18'],
  ['nineteen', '19'],
  ['twenty', '20'],
]);

class VideoService {
  normalizeVideoTitle(value, fallback = '') {
    const title = String(value || '').trim();
    if (!title) return String(fallback || '').trim();

    return title
      .replace(/^signvideo:\s*/i, '')
      .replace(/^sign_video:\s*/i, '')
      .replace(/^video:\s*/i, '')
      .replace(/^[:_\s]+/, '')
      .trim();
  }

  inferLetterGroup(title) {
    const candidate = this.normalizeVideoTitle(title).toLowerCase();
    const match = candidate.match(/[a-z]/);
    return match ? match[0] : null;
  }

  inferNumberGroup(title) {
    const candidate = this.normalizeVideoTitle(title).toLowerCase();
    const numberAtStart = candidate.match(/^(\d{1,2})\b/);
    if (numberAtStart) {
      const parsed = parseInt(numberAtStart[1], 10);
      if (parsed >= 1 && parsed <= 20) {
        return String(parsed);
      }
    }

    for (const [word, group] of NUMBER_WORD_GROUPS.entries()) {
      if (candidate.startsWith(word)) {
        return group;
      }
    }

    const numberAnyWhere = candidate.match(/(?:^|[^0-9])(1\d|20|[1-9])(?:[^0-9]|$)/);
    if (!numberAnyWhere) return null;

    const parsed = parseInt(numberAnyWhere[1], 10);
    if (parsed < 1 || parsed > 20) return null;

    return String(parsed);
  }

  normalizeResource(resource, group, index = 0, documentId = '') {
    const title = this.normalizeVideoTitle(resource?.title, group);
    const url = String(resource?.url || '').trim();

    return {
      id: String(resource?._id || `${documentId}:${group}:${index}`),
      url,
      group: String(group),
      name: title,
    };
  }

  async fetchDictionaryVideos() {
    const docs = await Translator.find({})
      .select('title videos')
      .lean();

    const videos = [];

    docs.forEach((doc) => {
      if (!Array.isArray(doc.videos)) return;

      doc.videos.forEach((video, index) => {
        const title = this.normalizeVideoTitle(video?.title, doc.title);
        const url = String(video?.url || '').trim();
        if (!title || !url) return;

        videos.push({
          _id: video?._id,
          title,
          url,
          documentId: String(doc._id || ''),
          index,
        });
      });
    });

    return videos;
  }

  async getNumbersVideos() {
    try {
      const videos = await this.fetchDictionaryVideos();

      return videos
        .map((resource) => {
          const group = this.inferNumberGroup(resource.title);
          if (!group) return null;
          return this.normalizeResource(resource, group, resource.index, resource.documentId);
        })
        .filter(Boolean)
        .sort((left, right) => {
          const groupDiff = Number(left.group) - Number(right.group);
          if (groupDiff !== 0) return groupDiff;
          return left.name.localeCompare(right.name);
        });
    } catch (error) {
      logger.error('Get numbers videos error:', error.message);
      throw error;
    }
  }

  async getNumberVideos(number) {
    try {
      const normalizedNumber = parseInt(String(number || '').trim(), 10);
      if (!Number.isInteger(normalizedNumber) || normalizedNumber < 1 || normalizedNumber > 20) {
        const validationError = new Error('number must be between 1 and 20');
        validationError.statusCode = 400;
        throw validationError;
      }

      const allNumberVideos = await this.getNumbersVideos();
      return allNumberVideos.filter((item) => Number(item.group) === normalizedNumber);
    } catch (error) {
      logger.error('Get number videos error:', error.message);
      throw error;
    }
  }

  async getAlphabetVideos(letter) {
    try {
      const normalizedLetter = String(letter || '').trim().toLowerCase();

      if (!/^[a-z]$/.test(normalizedLetter)) {
        const validationError = new Error('letter must be a-z');
        validationError.statusCode = 400;
        throw validationError;
      }

      const videos = await this.fetchDictionaryVideos();

      return videos
        .map((resource) => {
          const group = this.inferLetterGroup(resource.title);
          if (group !== normalizedLetter) return null;
          return this.normalizeResource(resource, normalizedLetter, resource.index, resource.documentId);
        })
        .filter(Boolean)
        .sort((left, right) => left.name.localeCompare(right.name));
    } catch (error) {
      logger.error('Get alphabet videos error:', error.message);
      throw error;
    }
  }

  async getDebugResources(prefix = '', limit = 20) {
    try {
      const normalizedPrefix = String(prefix || '').trim().toLowerCase();
      const normalizedLimit = Math.max(Math.min(parseInt(limit, 10) || 20, 100), 1);
      const videos = await this.fetchDictionaryVideos();

      const filtered = normalizedPrefix
        ? videos.filter((item) => {
            const title = String(item.name || '').toLowerCase();
            const group = String(item.group || '').toLowerCase();
            return title.includes(normalizedPrefix) || group.startsWith(normalizedPrefix);
          })
        : videos;

      return {
        source: 'mongodb',
        prefix: normalizedPrefix,
        limit: normalizedLimit,
        totalVideos: videos.length,
        matchedVideos: filtered.length,
        video: filtered.slice(0, normalizedLimit),
      };
    } catch (error) {
      logger.error('Get debug resources error:', error.message);
      throw error;
    }
  }
}

module.exports = new VideoService();