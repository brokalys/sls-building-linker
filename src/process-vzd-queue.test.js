const db = require('./shared/db');
const { run } = require('./process-vzd-queue');

jest.mock('./shared/db');

describe('process-vzd-queue', () => {
  afterEach(jest.clearAllMocks);

  test('updates the building id if a lat/lng match is found', async () => {
    db.findVzdBuildingIdByLatLng.mockResolvedValueOnce(111);

    await run({
      Records: [
        { body: JSON.stringify({ lat: 1, lng: 2, category: 'apartment' }) },
      ],
    });

    expect(db.findVzdBuildingIdByLatLng).toBeCalledWith(1, 2);
    expect(db.createPropertyBuildingLink).toBeCalled();
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

  test('ignores properties outside of Latvia', async () => {
    await run({
      Records: [
        {
          body: JSON.stringify({
            lat: 1,
            lng: 2,
            category: 'apartment',
            location_country: 'Estonia',
          }),
        },
      ],
    });

    expect(db.findVzdBuildingIdByLatLng).not.toBeCalled();
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
