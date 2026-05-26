const learnService = require('./learnService');
const logger = require('../../logger');

class LearnController {
  async createLesson(req, res, next) {
    try {
      const lesson = await learnService.createLesson(req.body);

      res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        data: lesson,
      });
    } catch (error) {
      logger.error('Create lesson controller error:', error.message);
      next(error);
    }
  }

  async getAllLessons(req, res, next) {
    try {
      const { type } = req.query;
      const lessons = await learnService.getAllLessons(type);

      res.status(200).json({
        success: true,
        message: 'Lessons retrieved successfully',
        data: lessons,
      });
    } catch (error) {
      logger.error('Get all lessons controller error:', error.message);
      next(error);
    }
  }

  async getLessonById(req, res, next) {
    try {
      const { lessonId } = req.params;
      const lesson = await learnService.getLessonById(lessonId);

      res.status(200).json({
        success: true,
        message: 'Lesson retrieved successfully',
        data: lesson,
      });
    } catch (error) {
      logger.error('Get lesson controller error:', error.message);
      next(error);
    }
  }

  async completeLesson(req, res, next) {
    try {
      const { lessonId } = req.body;

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide lessonId',
        });
      }

      const result = await learnService.completeLesson(req.userId, lessonId);

      res.status(200).json({
        success: true,
        message: 'Lesson completed',
        data: result,
      });
    } catch (error) {
      logger.error('Complete lesson controller error:', error.message);
      next(error);
    }
  }

  async getLearningHistory(req, res, next) {
    try {
      const history = await learnService.getUserLearningHistory(req.userId);

      res.status(200).json({
        success: true,
        message: 'Learning history retrieved',
        data: history,
      });
    } catch (error) {
      logger.error('Get learning history controller error:', error.message);
      next(error);
    }
  }
}

module.exports = new LearnController();
