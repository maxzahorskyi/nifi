import React, { ChangeEventHandler } from 'react';
import classes from '../../pages/UserSettingsPage/AccountSettings/index.module.scss';
import FormInput from '../../../../components/FormInput';

const restrictedWords = ['account', 'admin', 'moderator', 'owner', 'creator'];

const UsernameInput = () => {
  const validate: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { target } = e;
    const { value } = target;

    if (!value) {
      target.setCustomValidity('Username should not be empty');
      return;
    }

    if (Number(value[0])) {
      target.setCustomValidity('Username should be start as letter');
      return;
    }

    if (!/^[a-zA-Z0-9]*$/.test(value)) {
      target.setCustomValidity('Username should contain only latin letters and numbers');
      return;
    }

    if (value.length < 4) {
      target.setCustomValidity(
        `Username should be at least 4 characters long. Now ${value.length}`,
      );
      return;
    }

    if (!/[a-zA-Z]+/.test(value)) {
      target.setCustomValidity('Username should contain at least one letter');
      return;
    }

    const restrictedWord = restrictedWords.find((restrictedWord) => value.includes(restrictedWord));

    if (restrictedWord) {
      target.setCustomValidity(
        `Username should not contain word "${restrictedWord}" because it is restricted`,
      );
      return;
    }

    target.setCustomValidity('');
  };

  return (
    <FormInput
      onChange={validate}
      required
      onInvalid={validate}
      name="username"
      placeholder="Type username here"
      bordered={false}
      wrapClassName={classes.inputWrap}
      maxLength={16}
      className={classes.mediaInput}
      type="text"
    />
  );
};

export default UsernameInput;
