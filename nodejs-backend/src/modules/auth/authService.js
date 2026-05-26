const User = require('../auth/User');
const { generateToken } = require('../../utils/jwt');
const logger = require('../../logger');

class AuthService {
  getGoogleConfig() {
    const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const redirectUri = String(process.env.GOOGLE_REDIRECT_URI || '').trim();

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google OAuth is not configured');
    }

    return { clientId, clientSecret, redirectUri };
  }

  getGoogleAuthUrl(state) {
    const { clientId, redirectUri } = this.getGoogleConfig();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeGoogleCode(code) {
    const { clientId, clientSecret, redirectUri } = this.getGoogleConfig();

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(tokenPayload?.error_description || tokenPayload?.error || 'Failed to exchange Google code');
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });

    const profilePayload = await profileResponse.json();
    if (!profileResponse.ok) {
      throw new Error(profilePayload?.error?.message || 'Failed to load Google profile');
    }

    return {
      googleId: String(profilePayload.id || profilePayload.sub || '').trim(),
      email: String(profilePayload.email || '').trim().toLowerCase(),
      username: String(profilePayload.name || profilePayload.email || '').trim(),
    };
  }

  async register(username, email, password, role = 'user') {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'user',
      });

      await user.save();

      const token = generateToken(user._id, user.role);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      logger.error('Register error:', error.message);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const token = generateToken(user._id, user.role);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          score: user.score,
          streak: user.streak,
        },
        token,
      };
    } catch (error) {
      logger.error('Login error:', error.message);
      throw error;
    }
  }

  async googleSignin(email, googleId, username) {
    try {
      // Check if user with this email exists
      let user = await User.findOne({ email });

      if (user) {
        // Keep provider data in sync for existing accounts
        if (!user.googleId || user.googleId !== googleId) {
          user.googleId = googleId;
          user.provider = 'google';
          await user.save();
        }
      } else {
        // Create new user from Google profile
        const autoUsername = username || email.split('@')[0];
        user = new User({
          email,
          googleId,
          username: autoUsername,
          provider: 'google',
        });
        await user.save();
      }

      const token = generateToken(user._id, user.role);

      return {
        user: {
          _id: user._id,
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          score: user.score,
          streak: user.streak,
        },
        token,
      };
    } catch (error) {
      logger.error('Google signin error:', error.message);
      throw error;
    }
  }

  async googleLoginFromCode(code) {
    try {
      const profile = await this.exchangeGoogleCode(code);

      if (!profile.email || !profile.googleId) {
        throw new Error('Google profile is incomplete');
      }

      return await this.googleSignin(profile.email, profile.googleId, profile.username);
    } catch (error) {
      logger.error('Google login from code error:', error.message);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Get user error:', error.message);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await User.find({}).select('-password').sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Get all users error:', error.message);
      throw error;
    }
  }

  async deleteUserById(targetUserId, currentUserId) {
    try {
      if (!targetUserId) {
        throw new Error('User id is required');
      }

      if (String(targetUserId) === String(currentUserId)) {
        throw new Error('You cannot delete your own account');
      }

      const targetUser = await User.findById(targetUserId).select('-password');
      if (!targetUser) {
        throw new Error('User not found');
      }

      if (targetUser.role === 'admin') {
        const remainingAdminCount = await User.countDocuments({
          role: 'admin',
          _id: { $ne: targetUser._id },
        });

        if (remainingAdminCount === 0) {
          throw new Error('Cannot delete the last admin account');
        }
      }

      await User.findByIdAndDelete(targetUserId);

      return {
        id: targetUser._id,
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
      };
    } catch (error) {
      logger.error('Delete user error:', error.message);
      throw error;
    }
  }
}

module.exports = new AuthService();
