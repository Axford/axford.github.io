import DecodingError from './AisDecodingError.mjs';

export default class AisSentence {

  // eslint-disable-next-line max-statements
  constructor() {

  }
  
  parse(message) {
    this.message = message;

    const startIndex = this.message.indexOf('!');

    if (startIndex === -1) {
      throw new DecodingError('Start not found', this.message);
    }

    const messageFields = this.message.split(',');
    if (messageFields.length !== 7) {
      throw new DecodingError('Invalid length', this.message);
    }

    const suffix = messageFields[6].split('*');
    if (suffix.length !== 2) {
      throw new DecodingError('Invalid suffix', this.message);
    }

    this.talkerId = messageFields[0].substr(1, 2);
    this.type = messageFields[0].substr(3, 5);
    this.numParts = Number(messageFields[1]);
    this.partNumber = Number(messageFields[2]);
    this.partId = Number(messageFields[3]);
    this.channel = messageFields[4];
    this.payload = messageFields[5];
    this.fillBits = Number(suffix[0]);
    this.checksum = suffix[1];

    this.checkChecksum();
  }

  toSentence() {
    this.message = '!' + 
                   this.talkerId +
                   this.type + ',' +
                   this.numParts + ',' + 
                   this.partNumber + ',' +
                   this.partId + ',' +
                   this.channel + ',' +
                   this.payload + ',' +
                   this.fillBits + '*';
    this.message += this.calcChecksum();
  }

  isMultiPart() {
    return this.numParts > 1;
  }

  isLastPart() {
    return this.numParts === this.partNumber;
  }

  calcChecksum() {
    const checksumString = this.message
      .split('*')[0]
      .substr(1, this.message.length);
    let checksum = 0;

    for (let i = 0; i < checksumString.length; i++) {
      // eslint-disable-next-line no-bitwise
      checksum = checksum ^ checksumString.charCodeAt(i);
    }

    let checksumHex = checksum.toString(16).toUpperCase();

    if (checksumHex.length === 1) {
      checksumHex = `0${checksumHex}`;
    }

    return checksumHex;
  }

  checkChecksum() {
    if (this.calcChecksum() !== this.checksum) {
      throw new DecodingError('Invalid checksum', this.message);
    }
  }
}
