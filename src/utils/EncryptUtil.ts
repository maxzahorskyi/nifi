import { createCipheriv } from 'crypto';
import getConfig from 'next/config';

const config = getConfig().publicRuntimeConfig.services;

export default class EncryptUtil {
  private passphrase = config.secretPhrase;
  private iv = config.dataKey;
  private cipher = createCipheriv('aes-256-gcm', this.passphrase, this.iv);
  public encrypt(string: string): string | undefined {
    if (string && this.passphrase) {
      let encrypted = this.cipher.update(string, 'utf-8', 'hex');

      encrypted += this.cipher.final('hex');

      return `${encrypted}`;
    }
    return undefined;
  }
}
