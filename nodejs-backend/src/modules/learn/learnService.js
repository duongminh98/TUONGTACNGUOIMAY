const Lesson = require('./Lesson');
const LearningHistory = require('./LearningHistory');
const User = require('../auth/User');
const { calculateStreak } = require('../../utils/streak');
const logger = require('../../logger');

class LearnService {
  createHttpError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  normalizeResources(resources) {
    if (!Array.isArray(resources)) return [];

    return resources
      .map((item) => ({
        title: String(item?.title || '').trim(),
        url: String(item?.url || '').trim(),
      }))
      .filter((item) => item.title && item.url);
  }

  normalizePracticeQuestions(practiceQuestions) {
    if (!Array.isArray(practiceQuestions)) return [];

    return practiceQuestions
      .map((item) => ({
        url: String(item?.url || '').trim(),
        A: String(item?.A || '').trim(),
        B: String(item?.B || '').trim(),
        C: String(item?.C || '').trim(),
        D: String(item?.D || '').trim(),
        correct: String(item?.correct || '').trim().toUpperCase(),
      }))
      .filter((item) => item.url && item.A && item.B && item.C && item.D && ['A', 'B', 'C', 'D'].includes(item.correct));
  }

  async createLesson(payload = {}) {
    try {
      const title = String(payload.title || '').trim();
      const content = String(payload.content || '').trim();
      const type = payload.type === 'practice' ? 'practice' : 'lesson';
      const scoreRewardRaw = Number(payload.scoreReward);
      const orderRaw = Number(payload.order);
      const resources = this.normalizeResources(payload.resources);
      const practiceQuestions = this.normalizePracticeQuestions(payload.practiceQuestions);

      if (!title) {
        throw this.createHttpError('Title is required');
      }

      if (!content) {
        throw this.createHttpError('Content is required');
      }

      if (type === 'lesson' && resources.length === 0) {
        throw this.createHttpError('Lesson must include at least one resource');
      }

      if (type === 'practice' && practiceQuestions.length === 0) {
        throw this.createHttpError('Practice must include at least one question');
      }

      const scoreReward = Number.isFinite(scoreRewardRaw) ? Math.max(0, Math.floor(scoreRewardRaw)) : 10;

      let order = 0;
      if (Number.isFinite(orderRaw)) {
        order = Math.max(0, Math.floor(orderRaw));
      } else {
        const latestLesson = await Lesson.findOne({ type }).sort({ order: -1, createdAt: -1 });
        order = Math.max(0, (latestLesson?.order ?? -1) + 1);
      }

      const created = await Lesson.create({
        title,
        content,
        type,
        scoreReward,
        order,
        resources: type === 'lesson' ? resources : [],
        practiceQuestions: type === 'practice' ? practiceQuestions : [],
      });

      return this.mapLessonForResponse(created);
    } catch (error) {
      logger.error('Create lesson error:', error.message);
      throw error;
    }
  }

  mapLessonForResponse(lessonDoc) {
    const lesson = lessonDoc.toObject();
    const resources = Array.isArray(lesson.resources) ? lesson.resources : [];

    return {
      ...lesson,
      resources,
      // Keep old frontend UI working without any UI changes.
      content:
        lesson.content ||
        resources
          .map((item, index) => `${index + 1}. ${item.title}: ${item.url}`)
          .join('\n'),
    };
  }

  async getAllLessons(type = null) {
    try {
      const query = type ? { type } : {};
      const lessons = await Lesson.find(query).sort({ order: 1, createdAt: 1 });
      return lessons.map((lesson) => this.mapLessonForResponse(lesson));
    } catch (error) {
      logger.error('Get lessons error:', error.message);
      throw error;
    }
  }

  async getLessonById(lessonId) {
    try {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }
      return this.mapLessonForResponse(lesson);
    } catch (error) {
      logger.error('Get lesson error:', error.message);
      throw error;
    }
  }

  async completeLesson(userId, lessonId) {
    try {
      // Get lesson
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create learning history
      const learningHistory = new LearningHistory({
        userId,
        lessonId,
      });
      await learningHistory.save();

      // Update user score
      user.score += lesson.scoreReward;
      user.lastLearnedDate = new Date();

      // Update streak
      const histories = await LearningHistory.find({ userId }).sort({
        date: -1,
      });
      const dates = histories.map((h) => h.date);
      const { streak } = calculateStreak(dates);
      user.streak = streak;

      await user.save();

      return {
        message: 'Lesson completed successfully',
        scoreEarned: lesson.scoreReward,
        totalScore: user.score,
        streak: user.streak,
      };
    } catch (error) {
      logger.error('Complete lesson error:', error.message);
      throw error;
    }
  }

  async getUserLearningHistory(userId) {
    try {
      const histories = await LearningHistory.find({ userId })
        .populate('lessonId')
        .sort({ date: -1 });
      return histories;
    } catch (error) {
      logger.error('Get learning history error:', error.message);
      throw error;
    }
  }
}

module.exports = new LearnService();
