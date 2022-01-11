const { query } = require('serverless-mysql');
const db = require('./db');

jest.mock('serverless-mysql');

describe('updatePropertyBuildingId', () => {
  afterEach(jest.clearAllMocks);

  test('constructs the correct query', () => {
    db.updatePropertyBuildingId(111, 222);

    expect(query).toBeCalled();
    expect(query.mock.calls[0][0]).toMatchSnapshot();
  });
});

describe('createPropertyBuildingLink', () => {
  afterEach(jest.clearAllMocks);

  test('constructs the correct query', () => {
    db.createPropertyBuildingLink(111, 222, 'latlng');

    expect(query).toBeCalled();
    expect(query.mock.calls[0][0]).toMatchSnapshot();
  });
});

describe('findBuildingIdByLatLng', () => {
  afterEach(jest.clearAllMocks);

  test('constructs the correct query', () => {
    db.findBuildingIdByLatLng(56.123, 24.222);

    expect(query).toBeCalled();
    expect(query.mock.calls[0][0]).toMatchSnapshot();
  });

  test('returns nothing if nothing found', async () => {
    query.mockResolvedValueOnce([]);

    const output = await db.findBuildingIdByLatLng(56.123, 24.222);

    expect(output).toBeUndefined();
  });

  test('returns the row id if something is found', async () => {
    query.mockResolvedValueOnce([{ id: 333 }]);

    const output = await db.findBuildingIdByLatLng(56.123, 24.222);

    expect(output).toBe(333);
  });
});

describe('findVzdBuildingIdByLatLng', () => {
  afterEach(jest.clearAllMocks);

  test('constructs the correct query', () => {
    db.findVzdBuildingIdByLatLng(56.123, 24.222);

    expect(query).toBeCalled();
    expect(query.mock.calls[0][0]).toMatchSnapshot();
  });

  test('returns nothing if nothing found', async () => {
    query.mockResolvedValueOnce([]);

    const output = await db.findVzdBuildingIdByLatLng(56.123, 24.222);

    expect(output).toBeUndefined();
  });

  test('returns the row id if something is found', async () => {
    query.mockResolvedValueOnce([{ id: 333 }]);

    const output = await db.findVzdBuildingIdByLatLng(56.123, 24.222);

    expect(output).toBe(333);
  });
});

describe('findVzdBuildingIdByLocation', () => {
  afterEach(jest.clearAllMocks);

  test('constructs the correct query', () => {
    db.findVzdBuildingIdByLocation({
      city: 'riga',
      street: 'brivibas',
      housenumber: '12',
    });

    expect(query).toBeCalled();
    expect(query.mock.calls[0][0]).toMatchSnapshot();
  });

  test('returns nothing if nothing found', async () => {
    query.mockResolvedValueOnce([]);

    const output = await db.findVzdBuildingIdByLocation({
      city: 'riga',
      street: 'brivibas',
      housenumber: '12',
    });

    expect(output).toBeUndefined();
  });

  test('returns the row id if something is found', async () => {
    query.mockResolvedValueOnce([{ id: 333 }]);

    const output = await db.findVzdBuildingIdByLocation({
      city: 'riga',
      street: 'brivibas',
      housenumber: '12',
    });

    expect(output).toBe(333);
  });
});
