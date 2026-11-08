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
  MIN_SHELF_NAME_SIZE,
  MAX_SHELF_NAME_SIZE,
  MAX_BOOK_REVIEW_SIZE,
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
    username.trim().length >= MIN_USERNAME_SIZE &&
    username.trim().length <= MAX_USERNAME_SIZE
  );
}

function validateCode(code: string) {
  if (!code || typeof code !== 'string') return false;
  return CODE_REGEX.test(code);
}

function validateInputSubject(subject: string) {
  if (!subject || typeof subject !== 'string') return false;
  return (
    subject.trim().length >= MIN_SUPPORT_SUBJECT_SIZE &&
    subject.trim().length <= MAX_SUPPORT_SUBJECT_SIZE
  );
}

function validateInputText(text: string) {
  if (!text || typeof text !== 'string') return false;
  return (
    text.trim().length >= MIN_SUPPORT_TEXT_SIZE &&
    text.trim().length <= MAX_SUPPORT_TEXT_SIZE
  );
}

function validateShelfName(name: string) {
  if (!name || typeof name !== 'string') return false;
  return (
    name.trim().length >= MIN_SHELF_NAME_SIZE &&
    name.trim().length <= MAX_SHELF_NAME_SIZE
  );
}

function validateBookReview(review: string) {
  if (!review || typeof review !== 'string') return false;
  return review.trim().length <= MAX_BOOK_REVIEW_SIZE;
}

export {
  validateEmail,
  validatePassword,
  validateUserName,
  validateCode,
  validateInputSubject,
  validateInputText,
  validateShelfName,
  validateBookReview,
};
