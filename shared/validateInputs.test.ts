import { describe, expect, test } from 'vitest';

import {
  validateEmail,
  validatePassword,
  validateUserName,
  validateCode,
  validateInputSubject,
  validateInputText,
  validateShelfName,
  validateBookReview,
} from './validateInputs';

import {
  MIN_PASSWORD_SIZE,
  MAX_PASSWORD_SIZE,
  MIN_SHELF_NAME_SIZE,
  MAX_SHELF_NAME_SIZE,
  MAX_BOOK_REVIEW_SIZE,
  MIN_USERNAME_SIZE,
  MAX_USERNAME_SIZE,
  MIN_SUPPORT_SUBJECT_SIZE,
  MAX_SUPPORT_SUBJECT_SIZE,
  MIN_SUPPORT_TEXT_SIZE,
  MAX_SUPPORT_TEXT_SIZE,
  EMAIL_REGEX,
  CODE_REGEX,
} from './app.constant';

describe('validateEmail', () => {
  test('Normal email should pass', () => {
    expect(validateEmail('john.doe@gmail.com')).toBe(true);
  });

  test('Email without domain should fail', () => {
    expect(validateEmail('john.doe@')).toBe(false);
  });

  test('Email without @ should fail', () => {
    expect(validateEmail('john.doegmail.com')).toBe(false);
  });

  test('Empty input should fail', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('Whitespaces should fail', () => {
    expect(validateEmail('              ')).toBe(false);
  });
});

//-----

describe('validatePassword', () => {
  test('Normal password should pass', () => {
    expect(validatePassword('validPassword')).toBe(true);
  });

  test('Password of min size should pass', () => {
    expect(validatePassword('p'.repeat(MIN_PASSWORD_SIZE))).toBe(true);
  });

  test('Password of max size should pass', () => {
    expect(validatePassword('p'.repeat(MAX_PASSWORD_SIZE))).toBe(true);
  });

  test('Small password should fail', () => {
    expect(validatePassword('p'.repeat(MIN_PASSWORD_SIZE - 1))).toBe(false);
  });

  test('Big password should fail', () => {
    expect(validatePassword('p'.repeat(MAX_PASSWORD_SIZE + 1))).toBe(false);
  });

  test('Empty input should fail', () => {
    expect(validatePassword('')).toBe(false);
  });

  test('Whitespaces should fail', () => {
    expect(validatePassword(' '.repeat(MIN_PASSWORD_SIZE))).toBe(false);
  });
});

//-----

describe('validateUsername', () => {
  test('Normal username should pass', () => {
    expect(validateUserName('John Doe')).toBe(true);
  });

  test('Username of min size should pass', () => {
    expect(validateUserName('p'.repeat(MIN_USERNAME_SIZE))).toBe(true);
  });

  test('Username of max size should pass', () => {
    expect(validateUserName('p'.repeat(MAX_USERNAME_SIZE))).toBe(true);
  });

  test('Small username should fail', () => {
    expect(validateUserName('p'.repeat(MIN_USERNAME_SIZE - 1))).toBe(false);
  });

  test('Big username should fail', () => {
    expect(validateUserName('p'.repeat(MAX_USERNAME_SIZE + 1))).toBe(false);
  });

  test('Empty input should fail', () => {
    expect(validateUserName('')).toBe(false);
  });

  test('Whitespaces should fail', () => {
    expect(validateUserName(' '.repeat(MIN_USERNAME_SIZE))).toBe(false);
  });
});

//-----
describe('validateCode', () => {
  test('Normal code should pass', () => {
    expect(validateCode('123456')).toBe(true);
  });

  test('Small code should fail', () => {
    expect(validateCode('12345')).toBe(false);
  });

  test('Big code should fail', () => {
    expect(validateCode('1234567')).toBe(false);
  });

  test('Code without numbers should fail', () => {
    expect(validateCode('abcdef')).toBe(false);
  });

  test('Empty input should fail', () => {
    expect(validateCode('')).toBe(false);
  });

  test('Whitespaces should fail', () => {
    expect(validateCode(' '.repeat(6))).toBe(false);
  });
});

//-----

describe('validateInputSubject', () => {
  test('Normal input should pass', () => {
    expect(validateInputSubject('p'.repeat(MIN_SUPPORT_SUBJECT_SIZE + 1))).toBe(
      true,
    );
  });

  test('Small input should fail', () => {
    expect(validateInputSubject('p'.repeat(MIN_SUPPORT_SUBJECT_SIZE - 1))).toBe(
      false,
    );
  });

  test('Big input should fail', () => {
    expect(validateInputSubject('p'.repeat(MAX_SUPPORT_SUBJECT_SIZE + 1))).toBe(
      false,
    );
  });

  test('Empty input should fail', () => {
    expect(validateInputSubject('')).toBe(false);
  });

  test('Whitespaces should fail', () => {
    expect(validateInputSubject(' '.repeat(MIN_SUPPORT_SUBJECT_SIZE + 1))).toBe(
      false,
    );
  });
});

//-----

describe('validateInputText', () => {
  test('Normal input should pass', () => {
    expect(validateInputText('p'.repeat(MIN_SUPPORT_TEXT_SIZE + 1))).toBe(true);
  });

  test('Small input should fail', () => {
    expect(validateInputText('p'.repeat(MIN_SUPPORT_TEXT_SIZE - 1))).toBe(
      false,
    );
  });

  test('Big input should fail', () => {
    expect(validateInputText('p'.repeat(MAX_SUPPORT_TEXT_SIZE + 1))).toBe(
      false,
    );
  });

  test('Empty input should fail', () => {
    expect(validateInputText('')).toBe(false);
  });

  test('Whitespaces should fail', () => {
    expect(validateInputText(' '.repeat(MIN_SUPPORT_TEXT_SIZE + 1))).toBe(
      false,
    );
  });
});

//-----

describe('validateShelfName', () => {
  test('Normal shelf name should pass', () => {
    expect(validateShelfName('p'.repeat(MIN_SHELF_NAME_SIZE + 1))).toBe(true);
  });

  test('Small shelf name should fail', () => {
    expect(validateShelfName('p'.repeat(MIN_SHELF_NAME_SIZE - 1))).toBe(false);
  });

  test('Big shelf name should fail', () => {
    expect(validateShelfName('p'.repeat(MAX_SHELF_NAME_SIZE + 1))).toBe(false);
  });

  test('Empty input should fail', () => {
    expect(validateShelfName('')).toBe(false);
  });

  test('Whitespaces should fail', () => {
    expect(validateShelfName(' '.repeat(MIN_SHELF_NAME_SIZE + 1))).toBe(false);
  });
});

//-----

describe('validateBookReview', () => {
  test('Normal book review should pass', () => {
    expect(validateBookReview('p'.repeat(MAX_BOOK_REVIEW_SIZE - 1))).toBe(true);
  });

  test('Big book review should fail', () => {
    expect(validateBookReview('p'.repeat(MAX_BOOK_REVIEW_SIZE + 1))).toBe(
      false,
    );
  });

  test('Empty input should pass', () => {
    expect(validateBookReview('')).toBe(true);
  });

  test('Whitespaces should pass', () => {
    expect(validateBookReview(' '.repeat(MAX_BOOK_REVIEW_SIZE))).toBe(true);
  });
});
