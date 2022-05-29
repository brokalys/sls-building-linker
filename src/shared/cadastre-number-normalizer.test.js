const normalizer = require('./cadastre-number-normalizer');

describe('cadastre-number-normalizer', () => {
  test.each([
    ['Visā Latvijā', null],
    ['1', null],
    ['111', null],
    [null, null],
    ['01000762043', '01000762043'],
    ['09000140208001', '09000140208001'],
    ['90920040154', '90920040154'],
    ['0100 076 2043', '01000762043'],
    ['8092-004-0006', '80920040006'],
    ['8092:004:0006', '80920040006'],
    ['5444 006 0304 ezers', '54440060304'],
    ['8092 001? 0518', '80920010518'],
    ['Nr. 46460020022', '46460020022'],
    ['822828522829272', '82282852282927'],
    // ['68 010 010 064/-066', '68010010064'], // TODO: advanced edge case
    [null, null],
  ])('given %j cadastre number outputs %j', (input, expectation) => {
    const output = normalizer(input);

    expect(output).toEqual(expectation);
  });
});
