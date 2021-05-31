const parser = require('./address-parser');

describe('parser', () => {
  it.each([
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: 'Hospitāļu iela 1',
      },
      {
        city: 'riga',
        street: 'hospitalu',
        housenumber: '1',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: 'Hospitāļu iela 1k2',
      },
      {
        city: 'riga',
        street: 'hospitalu',
        housenumber: '1 k 2',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: 'Hospitāļu iela 1k 2',
      },
      {
        city: 'riga',
        street: 'hospitalu',
        housenumber: '1 k 2',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: null,
      },
      {
        city: 'riga',
        street: undefined,
        housenumber: undefined,
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: 'Hospitāļu iela (korpuss 2) 1',
      },
      {
        city: 'riga',
        street: 'hospitalu',
        housenumber: '1',
      },
    ],
    [
      {
        location_district: 'Rīgas Pilsēta',
        location_parish: 'centrs',
        location_address: 'Hospitāļu iela 1',
      },
      {
        city: 'riga',
        street: 'hospitalu',
        housenumber: '1',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: 'Hospitāļu iela',
      },
      {
        city: 'riga',
        street: 'hospitalu',
        housenumber: undefined,
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: 'Hospitāļu 1k1',
      },
      {
        city: 'riga',
        street: 'hospitalu',
        housenumber: '1 k 1',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: '13. Janvāra iela 4',
      },
      {
        city: 'riga',
        street: '13 janvara',
        housenumber: '4',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: 'Zolitudes iela 34 k-1',
      },
      {
        city: 'riga',
        street: 'zolitudes',
        housenumber: '34 k 1',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: 'centrs',
        location_address: 'Čiekurkalna 5. šķērslīnija 15 k-2',
      },
      {
        city: 'riga',
        street: 'ciekurkalna 5 skerslinija',
        housenumber: '15 k 2',
      },
    ],
    [
      {
        location_district: 'Ogre',
        location_parish: null,
        location_address: 'Ogre, Ausekļa prospekts, 9',
      },
      {
        city: 'ogre',
        street: 'ogre ausekla prospekts',
        housenumber: '9',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: null,
        location_address: 'Rīga;Dzirnezers,13 Janvāra iela 4',
      },
      {
        city: 'riga',
        street: '13 janvara',
        housenumber: '4',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: null,
        location_address: 'Rīga;Dzirnezers,13 Janvāra 4',
      },
      {
        city: 'riga',
        street: '13 janvara',
        housenumber: '4',
      },
    ],
    [
      {
        location_district: 'Rīga',
        location_parish: null,
        location_address: 'Rīga;Dzirnezers,13 Janvāra 4',
      },
      {
        city: 'riga',
        street: '13 janvara',
        housenumber: '4',
      },
    ],
    // [
    //   {
    //     location_district: 'Liepāja',
    //     location_parish: null,
    //     location_address: 'Liepu 2, Raiņa 18',
    //   },
    //   {
    //     city: 'liepaja',
    //     street: 'raina',
    //     housenumber: '18',
    //   },
    // ],
    [
      {
        location_district: 'Salaspils',
        location_parish: null,
        location_address: 'Salaspils, Slokas 5/1',
      },
      {
        city: 'salaspils',
        street: 'slokas',
        housenumber: '5 1',
      },
    ],
    [
      {
        location_district: 'Jūrmala',
        location_parish: null,
        location_address: 'Babītes iela 5, 5a',
      },
      {
        city: 'jurmala',
        street: 'babites',
        housenumber: '5 5 a',
      },
    ],
    [
      {
        location_district: 'Jūrmala',
        location_parish: null,
        location_address: 'Babītes iela 1**',
      },
      {
        city: 'jurmala',
        street: 'babites',
        housenumber: '1',
      },
    ],
    // [
    //   {
    //     location_district: 'Rīgas rajons',
    //     location_parish: null,
    //     location_address: 'Skunu iela 5, Balozi 5',
    //   },
    //   {
    //     city: 'rigas rajons',
    //     street: 'skunu',
    //     housenumber: '5',
    //   },
    // ],
  ])('normalizes correctly: %j', (input, expectation) => {
    const output = parser(input);

    expect(output).toEqual(expectation);
  });
});
