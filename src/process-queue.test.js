const db = require('./shared/db');
const { run } = require('./process-queue');

jest.mock('./shared/db');

describe('process-queue', () => {
  afterEach(jest.clearAllMocks);

  test('updates the building id if a match is found', async () => {
    db.findBuildingId.mockResolvedValueOnce(111);

    await run({
      Records: [{ body: JSON.stringify({ lat: 1, lng: 2 }) }],
    });

    expect(db.findBuildingId).toBeCalledWith(1, 2);
    expect(db.updatePropertyBuildingId).toBeCalled();
  });

  test('ignores properties with no building matches', async () => {
    await run({
      Records: [{ body: JSON.stringify({ lat: 1, lng: 2 }) }],
    });

    expect(db.findBuildingId).toBeCalledWith(1, 2);
    expect(db.updatePropertyBuildingId).not.toBeCalled();
  });

  test('works for multiple properties', async () => {
    db.findBuildingId.mockResolvedValueOnce(111);

    await run({
      Records: [
        { body: JSON.stringify({ lat: 1, lng: 2 }) },
        { body: JSON.stringify({ lat: 1, lng: 2 }) },
        { body: JSON.stringify({ lat: 1, lng: 2 }) },
      ],
    });

    expect(db.findBuildingId).toBeCalledTimes(3);
    expect(db.updatePropertyBuildingId).toBeCalledTimes(1);
  });
});
