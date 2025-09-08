const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('./database');
const { verifyAppleToken } = require('apple-signin-auth');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0]?.value;
        const name = profile.displayName;
        const googleId = profile.id;

        if (!email) {
          return done(new Error('No email found from Google profile'), null);
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // User exists, update Google ID if not set
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId },
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
              },
            });
          }
        } else {
          // Create new user
          const randomPassword = await bcrypt.hash(
            Math.random().toString(36).substring(2, 15),
            12
          );

          user = await prisma.user.create({
            data: {
              email,
              name,
              password: randomPassword,
              googleId,
              role: 'TENANT',
              isActive: true,
              verifiedAt: new Date(),
            },
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0]?.value;
        const name = `${profile.name.givenName} ${profile.name.familyName}`;
        const facebookId = profile.id;

        if (!email) {
          return done(new Error('No email found from Facebook profile'), null);
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // User exists, update Facebook ID if not set
          if (!user.facebookId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { facebookId },
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
              },
            });
          }
        } else {
          // Create new user
          const randomPassword = await bcrypt.hash(
            Math.random().toString(36).substring(2, 15),
            12
          );

          user = await prisma.user.create({
            data: {
              email,
              name,
              password: randomPassword,
              facebookId,
              role: 'TENANT',
              isActive: true,
              verifiedAt: new Date(),
            },
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Facebook OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Apple Sign In handler (manual implementation since no official Passport strategy)
const handleAppleSignIn = async (appleToken, userInfo = null) => {
  try {
    // Verify Apple token
    const applePayload = await verifyAppleToken(appleToken, {
      audience: process.env.APPLE_CLIENT_ID,
      issuer: 'https://appleid.apple.com',
    });

    if (!applePayload) {
      throw new Error('Invalid Apple token');
    }

    const appleId = applePayload.sub;
    let email = applePayload.email;
    let name = 'Apple User';

    // If userInfo is provided (first time sign in), use it
    if (userInfo) {
      email = userInfo.email || email;
      name = userInfo.name
        ? `${userInfo.name.firstName || ''} ${userInfo.name.lastName || ''}`.trim()
        : name;
    }

    if (!email) {
      throw new Error('No email found from Apple Sign In');
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // User exists, update Apple ID if not set
      if (!user.appleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { appleId },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        });
      }
    } else {
      // Create new user
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).substring(2, 15),
        12
      );

      user = await prisma.user.create({
        data: {
          email,
          name,
          password: randomPassword,
          appleId,
          role: 'TENANT',
          isActive: true,
          verifiedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Apple Sign In error:', error);
    throw error;
  }
};

module.exports = {
  passport,
  handleAppleSignIn,
};
