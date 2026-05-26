const authService = require('./authService');
const logger = require('../../logger');
const crypto = require('crypto');

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, pair) => {
    const [rawKey, ...rest] = pair.split('=');
    const key = rawKey?.trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('=').trim());
    return acc;
  }, {});
}

function buildCookie(name, value, maxAgeSeconds = 600) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

class AuthController {
  async register(req, res, next) {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide username, email, and password',
        });
      }

      const result = await authService.register(username, email, password, role);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Register controller error:', error.message);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password',
        });
      }

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      logger.error('Login controller error:', error.message);
      next(error);
    }
  }

  async googleSignin(req, res, next) {
    try {
      const { email, googleId, username } = req.body;

      if (!email || !googleId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and googleId',
        });
      }

      const result = await authService.googleSignin(email, googleId, username);

      res.status(200).json({
        success: true,
        message: 'Google signin successful',
        data: result,
      });
    } catch (error) {
      logger.error('Google signin controller error:', error.message);
      next(error);
    }
  }

  async googleStart(req, res, next) {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      const authUrl = authService.getGoogleAuthUrl(state);

      res.setHeader('Set-Cookie', buildCookie('google_oauth_state', state));
      res.redirect(302, authUrl);
    } catch (error) {
      logger.error('Google start controller error:', error.message);
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const { code, state, error: googleError } = req.query;
      const cookies = parseCookies(req.headers.cookie || '');
      const cookieState = cookies.google_oauth_state;
      const frontendUrl = String(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

      if (googleError) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(String(googleError))}`);
      }

      if (!code) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Missing Google authorization code')}`);
      }

      if (!state || !cookieState || state !== cookieState) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Invalid Google OAuth state')}`);
      }

      const result = await authService.googleLoginFromCode(String(code));
      const redirectToken = encodeURIComponent(result.token);

      res.setHeader('Set-Cookie', [
        'google_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      ]);

      return res.redirect(`${frontendUrl}/auth/google/callback#token=${redirectToken}`);
    } catch (error) {
      logger.error('Google callback controller error:', error.message);
      return res.redirect(`${String(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '')}/login?error=${encodeURIComponent(error.message || 'Google login failed')}`);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserById(req.userId);

      res.status(200).json({
        success: true,
        message: 'User profile retrieved',
        data: user,
      });
    } catch (error) {
      logger.error('Get profile controller error:', error.message);
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      logger.error('Get all users controller error:', error.message);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User id is required',
        });
      }

      const deletedUser = await authService.deleteUserById(userId, req.userId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: deletedUser,
      });
    } catch (error) {
      logger.error('Delete user controller error:', error.message);
      next(error);
    }
  }
}

module.exports = new AuthController();
