import {
  MIN_PASSWORD_SIZE,
  MAX_PASSWORD_SIZE,
  MIN_USERNAME_SIZE,
  MAX_USERNAME_SIZE,
  EMAIL_REGEX,
  CODE_REGEX,
  MIN_SUPPORT_SUBJECT_SIZE,
  MAX_SUPPORT_SUBJECT_SIZE,
  MIN_SUPPORT_TEXT_SIZE,
  MAX_SUPPORT_TEXT_SIZE,
} from './app.constant.js';

function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email);
}

function validatePassword(password: string) {
  if (!password || typeof password !== 'string') return false;
  return (
    password.length >= MIN_PASSWORD_SIZE && password.length <= MAX_PASSWORD_SIZE
  );
}

function validateUserName(username: string) {
  if (!username || typeof username !== 'string') return false;
  return (
    username.length >= MIN_USERNAME_SIZE && username.length <= MAX_USERNAME_SIZE
  );
}

function validateCode(code: string) {
  if (!code || typeof code !== 'string') return false;
  return CODE_REGEX.test(code);
}

function validateInputSubject(subject: string) {
  if (!subject || typeof subject !== 'string') return false;
  return (
    subject.length >= MIN_SUPPORT_SUBJECT_SIZE &&
    subject.length <= MAX_SUPPORT_SUBJECT_SIZE
  );
}

function validateInputText(text: string) {
  if (!text || typeof text !== 'string') return false;
  return (
    text.length >= MIN_SUPPORT_TEXT_SIZE && text.length <= MAX_SUPPORT_TEXT_SIZE
  );
}

export {
  validateEmail,
  validatePassword,
  validateUserName,
  validateCode,
  validateInputSubject,
  validateInputText,
};
