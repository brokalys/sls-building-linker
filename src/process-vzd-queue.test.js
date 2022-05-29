const db = require('./shared/db');
const { run } = require('./process-vzd-queue');

jest.mock('./shared/db');

describe('process-vzd-queue', () => {
  afterEach(jest.clearAllMocks);

  test('creates the building link if a cadastre number match is found for category=house', async () => {
    db.findVzdIdByCadastreNumber.mockResolvedValueOnce({
      id: 111,
      type: 'building',
    });

    await run({
      Records: [
        {
          body: JSON.stringify({
            category: 'house',
            cadastre_number: '8092 001 0518',
          }),
        },
      ],
    });

    expect(db.findVzdIdByCadastreNumber).toBeCalledWith('80920010518', 'house');
    expect(db.createPropertyBuildingLink).toBeCalledTimes(1);
    expect(db.createPropertyLandLink).toBeCalledTimes(0);
  });

  test('creates the land link if a cadastre number match is found for category=land', async () => {
    db.findVzdIdByCadastreNumber.mockResolvedValueOnce({
      id: 111,
      type: 'land',
    });

    await run({
      Records: [
        {
          body: JSON.stringify({
            category: 'land',
            cadastre_number: '8092 001 0518',
          }),
        },
      ],
    });

    expect(db.findVzdIdByCadastreNumber).toBeCalledWith('80920010518', 'land');
    expect(db.createPropertyLandLink).toBeCalledTimes(1);
    expect(db.createPropertyBuildingLink).toBeCalledTimes(0);
  });

  test('ignores properties that return no cadastre-number match', async () => {
    db.findVzdIdByCadastreNumber.mockResolvedValueOnce({});

    await run({
      Records: [
        {
          body: JSON.stringify({
            category: 'land',
            cadastre_number: '8092 001 0518',
          }),
        },
      ],
    });

    expect(db.findVzdIdByCadastreNumber).toBeCalledWith('80920010518', 'land');
    expect(db.createPropertyBuildingLink).toBeCalledTimes(0);
    expect(db.createPropertyLandLink).toBeCalledTimes(0);
  });

  test('ignores properties with no cadastre_number field', async () => {
    await run({
      Records: [
        {
          body: JSON.stringify({
            category: 'house',
            cadastre_number: null,
          }),
        },
      ],
    });

    expect(db.findVzdIdByCadastreNumber).not.toBeCalled();
    expect(db.createPropertyBuildingLink).toBeCalledTimes(0);
  });

  test('ignores properties with invalid cadastre_number field', async () => {
    await run({
      Records: [
        {
          body: JSON.stringify({
            category: 'house',
            cadastre_number: 'totally invalid',
          }),
        },
      ],
    });

    expect(db.findVzdIdByCadastreNumber).not.toBeCalled();
    expect(db.createPropertyBuildingLink).toBeCalledTimes(0);
  });

  test('creates the building id if a address match is found', async () => {
    db.findVzdBuildingIdByLocation.mockResolvedValueOnce(111);

    await run({
      Records: [
        {
          body: JSON.stringify({
            category: 'apartment',
            location_district: 'Rīga',
            location_address: 'Brīvības iela 14',
          }),
        },
      ],
    });

    expect(db.findVzdBuildingIdByLocation).toBeCalledWith(
      expect.objectContaining({
        city: 'riga',
        street: 'brivibas',
        housenumber: '14',
      }),
    );
    expect(db.createPropertyBuildingLink).toBeCalledTimes(1);
  });

  test('creates the building id and latlng link if both matched for category = "apartment"', async () => {
    db.findVzdBuildingIdByLocation.mockResolvedValueOnce(111);
    db.findVzdBuildingIdByLatLng.mockResolvedValueOnce(111);

    await run({
      Records: [
        {
          body: JSON.stringify({
            category: 'apartment',
            lat: 1,
            lng: 2,
            location_district: 'Rīga',
            location_address: 'Brīvības iela 14',
          }),
        },
      ],
    });

    expect(db.createPropertyBuildingLink).toBeCalledTimes(2);
  });

  test('creates the land id and latlng link if lat/lng match found for category = "land"', async () => {
    db.findVzdLandIdByLatLng.mockResolvedValueOnce(222);

    await run({
      Records: [
        {
          body: JSON.stringify({
            category: 'land',
            lat: 1,
            lng: 2,
            location_district: 'Rīga',
            location_address: 'Brīvības iela 14',
          }),
        },
      ],
    });

    expect(db.createPropertyLandLink).toBeCalledTimes(1);
  });

  test('updates the building id if a lat/lng match is found', async () => {
    db.findVzdBuildingIdByLatLng.mockResolvedValueOnce(111);

    await run({
      Records: [
        { body: JSON.stringify({ lat: 1, lng: 2, category: 'apartment' }) },
      ],
    });

    expect(db.findVzdBuildingIdByLatLng).toBeCalledWith(1, 2);
    expect(db.createPropertyBuildingLink).toBeCalledTimes(1);
  });

  test('ignores properties with no lat/lng building matches', async () => {
    await run({
      Records: [
        { body: JSON.stringify({ lat: 1, lng: 2, category: 'apartment' }) },
      ],
    });

    expect(db.findVzdBuildingIdByLatLng).toBeCalledWith(1, 2);
    expect(db.createPropertyBuildingLink).not.toBeCalled();
  });

  test('ignores LAND properties', async () => {
    await run({
      Records: [
        {
          body: JSON.stringify({ lat: 1, lng: 2, category: 'land' }),
        },
      ],
    });

    expect(db.findVzdBuildingIdByLatLng).not.toBeCalled();
    expect(db.createPropertyBuildingLink).not.toBeCalled();
  });

  test('ignores property in specific ignored coords', async () => {
    await run({
      Records: [
        {
          body: JSON.stringify({ lat: 56, lng: 24, category: 'apartment' }),
        },
      ],
    });

    expect(db.findVzdBuildingIdByLatLng).not.toBeCalled();
    expect(db.createPropertyBuildingLink).not.toBeCalled();
  });

  test('works for multiple properties', async () => {
    db.findVzdBuildingIdByLatLng.mockResolvedValueOnce(111);

    await run({
      Records: [
        { body: JSON.stringify({ lat: 1, lng: 2, category: 'apartment' }) },
        { body: JSON.stringify({ lat: 1, lng: 2, category: 'apartment' }) },
        { body: JSON.stringify({ lat: 1, lng: 2, category: 'house' }) },
      ],
    });

    expect(db.findVzdBuildingIdByLatLng).toBeCalledTimes(3);
    expect(db.createPropertyBuildingLink).toBeCalledTimes(1);
  });
});
