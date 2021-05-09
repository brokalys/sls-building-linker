/**
 * @todo: clean up this whole file..
 */
const removeDiacritics = require('diacritics').remove;

function parser(data) {
  const normalized = normalizer(data);

  return {
    city:
      normalized.district === 'riga'
        ? 'riga'
        : normalized.parish || normalized.district,
    street: normalized.address,
    housenumber: normalized.house_number,
  };
}

function normalizer(data) {
  const houseNumber = getHouseNumber(data.location_address || '');
  const houseNumRegex = new RegExp(` ${houseNumber}$`);

  let district = normalizeString(data.location_district, true, 21);
  let parish = normalizeString(data.location_parish, true);
  let address = normalizeString(
    parseAddress(data.location_address, houseNumRegex),
    true,
    34,
  );

  if (district === 'valga') district = 'valka';
  if (parish === 'valga') parish = 'valka';

  if (district !== 'jekabpils' && parish !== 'jekabpils') {
    if (
      address === 'barona' ||
      address == 'k barona' ||
      address == 'kr barona'
    ) {
      address = 'krisjana barona';
    }
  }

  if (address === 'p brieza' || address == 'brieza') {
    address = 'pulkveza brieza';
  }

  if (address === 'g astras' || address == 'astras') {
    address = 'gunara astras';
  }

  if (address === 'j cakstes' || address == 'cakstes') {
    address = 'jana cakstes';
  }

  if (address === 'caka' || address == 'a caka') {
    address = 'aleksandra caka';
  }

  if (address === 'ranka d') {
    address = 'ranka dambis';
  }

  if (
    address === 'j alunana' ||
    address == 'alunana' ||
    address == 'alunana j'
  ) {
    address = 'jura alunana';
  }

  if (address === 'n reriha' || address == 'reriha') {
    address = 'nikolaja reriha';
  }

  if (
    address === 'e b upisa' ||
    address === 'eb upisa' ||
    address == 'e upisa' ||
    address == 'upisa'
  ) {
    address = 'ernesta birznieka upisa';
  }

  if (address === 'o vaciesa' || address == 'vaciesa') {
    address = 'ojara vaciesa';
  }

  if (address === 'f brivzemnieka' || address == 'brivzemnieka') {
    address = 'frica brivzemnieka';
  }

  if (address === 'e smilga' || address == 'smilga') {
    address = 'eduarda smilga';
  }

  if (address === 'm nometnu') {
    address = 'maza nometnu';
  }

  if (district === 'riga' || parish === 'riga') {
    if (
      address === 'valdemara' ||
      address == 'k valdemara' ||
      address == 'kr valdemara'
    ) {
      address = 'krisjana valdemara';
    }

    if (address === 'a pumpura' || address == 'pumpura') {
      address = 'andreja pumpura';
    }
  }

  return {
    ...data,
    district,
    parish,
    address,
    house_number: normalizeString(
      processText(houseNumber || '').join(' '),
      true,
      10,
    ),
  };
}

function parseAddress(address, houseNumRegex) {
  const withoutHouseNum = address || '';

  const parts = withoutHouseNum.split(/[;,]/);
  const partWithStreet = parts.findIndex((str) => houseNumRegex.test(str));
  const guessedStreetName = (parts[partWithStreet] || '').replace(
    houseNumRegex,
    '',
  );

  if (guessedStreetName) {
    return guessedStreetName;
  }

  return withoutHouseNum.replace(houseNumRegex, '');
}

function processText(inputText) {
  var output = [];
  var json = inputText.split(' ');
  json.forEach(function (item) {
    output.push(item.replace(/\'/g, '').split(/(\d+)/).filter(Boolean));
  });
  return output;
}

function getHouseNumber(str) {
  const parts = str.replace(/\((.*?)\)/g, '').split(' ');

  const number = [];
  parts.forEach((part, i) => {
    if (
      (i > 0 && parseInt(part, 10) && !/\.$/.test(part)) ||
      number.length > 0
    ) {
      number.push(part);
    }
  });

  return number.join(' ') || undefined;
}

function normalizeString(input, removeSymbols = false, maxLength = 34) {
  if (!input) {
    return;
  }

  let output = input;

  output = removeDiacritics(output);
  output = output.toLowerCase();
  output = output.replace(/\((.*?)\)/g, '');
  if (removeSymbols) output = output.replace(/[^a-z0-9]/gi, ' ');
  output = output.replace(/\s\s+/g, ' ');
  output = output.replace(/\siela\s/, ' ');
  output = output.replace(/\siela/, '');
  if (removeSymbols) output = output.replace(/[^a-z0-9\s]/gi, '');

  // Special cases
  if (output === 'rigas pilseta') return 'riga';

  output = output.trim();

  if (output.length > maxLength) {
    return;
  }

  return output;
}

module.exports = parser;
