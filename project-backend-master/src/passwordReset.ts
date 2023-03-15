import { commitData, getData } from './dataStore';
import { generateRandomString } from './tokens';
import { encryptPassword, getUserByEmail } from './auth';
import { join } from 'path';
import { readFileSync } from 'fs';
import HTTPError from 'http-errors';
import nodemailer from 'nodemailer';
import { authLogout } from './admin';

const emailAppPasscode = 'spsmimjfppwoytit';
const emailSender = 'beans.w13b.crunchie@gmail.com';
const emailFromName = `"Beans" <${emailSender}>`;

/**
 * Perform a password reset request
 */
export const requestPasswordReset = async (email: string, useFake: boolean) => {
  const user = getUserByEmail(email);
  if (user === null) {
    return {};
  }

  // Invalidate all sessions
  authLogout(user.uID);

  const resetCode = generateRandomString(6);
  getData().passwordResetCodes[resetCode] = user.uID;
  commitData();

  const transporter = await (useFake
    ? makeTestTransport
    : makeRealTransport
  )();

  const htmlBody = readFileSync(join(
    '.', 'src', 'emailTemplate.html'
  ), {
    encoding: 'utf-8'
  }).replace('{{reset_code}}', resetCode);

  const info = await transporter.sendMail({
    from: emailFromName,
    to: email,
    subject: 'Beans password reset!',
    text: `Your reset code is: ${resetCode}`,
    html: htmlBody
  });

  console.log(info.messageId);

  if (useFake) {
    console.log('Sent fake email, link:', nodemailer.getTestMessageUrl(info));
  }
};

/**
 * Make an ethereal nodemailer transport
 */
const makeTestTransport = async () => {
  console.log('Sending test email...');

  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Ignore this next function for coverage since it's substituted
// for the equivalent test function in the tests.

/* istanbul ignore next */
const makeRealTransport = async () => {
  console.log(
    ' !!! NOTE: the email may end up in spam, please check there !!!'
  );

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailSender,
      pass: emailAppPasscode,
    },
  });
};

/**
 * Perform a password reset
 */
export const performPasswordReset = (resetCode: string, newPassword: string) => {
  if (newPassword.length < 6) {
    throw HTTPError(400, 'password too short');
  }

  const resetCodes = getData().passwordResetCodes;
  const uId = resetCodes[resetCode];
  delete resetCodes[resetCode];

  if (uId !== undefined) {
    getData().users.find(
      user => user.uID === uId
    ).passwordHash = encryptPassword(
      newPassword
    );
  }

  commitData();

  if (uId === undefined) {
    throw HTTPError(400, 'invalid password reset');
  }

  return {};
};
