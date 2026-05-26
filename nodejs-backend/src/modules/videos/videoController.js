const videoService = require('./videoService');
const logger = require('../../logger');

class VideoController {
  async getDebugResources(req, res, next) {
    try {
      const { prefix = '', limit = 20 } = req.query;
      const data = await videoService.getDebugResources(prefix, limit);

      res.status(200).json({
        success: true,
        message: 'MongoDB dictionary resources retrieved successfully',
        data,
      });
    } catch (error) {
      logger.error('Get debug resources controller error:', error.message);
      next(error);
    }
  }

  async getNumbers(req, res, next) {
    try {
      const data = await videoService.getNumbersVideos();
      res.status(200).json(data);
    } catch (error) {
      logger.error('Get numbers videos controller error:', error.message);
      next(error);
    }
  }

  async getNumber(req, res, next) {
    try {
      const { number } = req.params;
      const data = await videoService.getNumberVideos(number);
      res.status(200).json(data);
    } catch (error) {
      logger.error('Get number videos controller error:', error.message);
      next(error);
    }
  }

  async getAlphabet(req, res, next) {
    try {
      const { letter } = req.params;
      const data = await videoService.getAlphabetVideos(letter);
      res.status(200).json(data);
    } catch (error) {
      logger.error('Get alphabet videos controller error:', error.message);
      next(error);
    }
  }
}

module.exports = new VideoController();