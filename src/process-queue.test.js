const db = require('./shared/db');
const { run } = require('./process-queue');

jest.mock('./shared/db');

describe('process-queue', () => {
  afterEach(jest.clearAllMocks);

  test('updates the building id if a address match is found', async () => {
    db.findBuildingIdByLocation.mockResolvedValueOnce(111);

    await run({
      Records: [
        {
          body: JSON.stringify({
            location_district: 'Rīga',
            location_address: 'Brīvības iela 14',
          }),
        },
      ],
    });

    expect(db.findBuildingIdByLocation).toBeCalledWith(
      expect.objectContaining({
        city: 'riga',
        street: 'brivibas',
        housenumber: '14',
      }),
    );
    expect(db.findBuildingIdByLatLng).not.toBeCalled();
    expect(db.updatePropertyBuildingId).toBeCalled();
  });

  test('updates the building id if a lat/lng match is found', async () => {
    db.findBuildingIdByLatLng.mockResolvedValueOnce(111);

    await run({
      Records: [{ body: JSON.stringify({ lat: 1, lng: 2 }) }],
    });

    expect(db.findBuildingIdByLatLng).toBeCalledWith(1, 2);
    expect(db.updatePropertyBuildingId).toBeCalled();
  });

  test('ignores properties with no lat/lng building matches', async () => {
    await run({
      Records: [{ body: JSON.stringify({ lat: 1, lng: 2 }) }],
    });

    expect(db.findBuildingIdByLatLng).toBeCalledWith(1, 2);
    expect(db.updatePropertyBuildingId).not.toBeCalled();
  });

  test('ignores properties outside of Latvia', async () => {
    await run({
      Records: [
        {
          body: JSON.stringify({ lat: 1, lng: 2, location_country: 'Estonia' }),
        },
      ],
    });

    expect(db.findBuildingIdByLatLng).not.toBeCalled();
    expect(db.updatePropertyBuildingId).not.toBeCalled();
  });

  test('ignores LAND properties', async () => {
    await run({
      Records: [
        {
          body: JSON.stringify({ lat: 1, lng: 2, category: 'land' }),
        },
      ],
    });

    expect(db.findBuildingIdByLatLng).not.toBeCalled();
    expect(db.updatePropertyBuildingId).not.toBeCalled();
  });

  test('works for multiple properties', async () => {
    db.findBuildingIdByLatLng.mockResolvedValueOnce(111);

    await run({
      Records: [
        { body: JSON.stringify({ lat: 1, lng: 2 }) },
        { body: JSON.stringify({ lat: 1, lng: 2 }) },
        { body: JSON.stringify({ lat: 1, lng: 2 }) },
      ],
    });

    expect(db.findBuildingIdByLatLng).toBeCalledTimes(3);
    expect(db.updatePropertyBuildingId).toBeCalledTimes(1);
  });
});
