const { query } = require('serverless-mysql');
const db = require('./db');

jest.mock('serverless-mysql');

describe('createPropertyBuildingLink', () => {
  afterEach(jest.clearAllMocks);

  test('constructs the correct query', () => {
    db.createPropertyBuildingLink(111, 222, 'latlng');

    expect(query).toBeCalled();
    expect(query.mock.calls[0][0]).toMatchSnapshot();
  });
});

describe('createPropertyLandLink', () => {
  afterEach(jest.clearAllMocks);

  test('constructs the correct query', () => {
    db.createPropertyLandLink(111, 222, 'latlng');

    expect(query).toBeCalled();
    expect(query.mock.calls[0][0]).toMatchSnapshot();
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

describe('findVzdLandIdByLatLng', () => {
  afterEach(jest.clearAllMocks);

  test('constructs the correct query', () => {
    db.findVzdLandIdByLatLng(56.123, 24.222);

    expect(query).toBeCalled();
    expect(query.mock.calls[0][0]).toMatchSnapshot();
  });

  test('returns nothing if nothing found', async () => {
    query.mockResolvedValueOnce([]);

    const output = await db.findVzdLandIdByLatLng(56.123, 24.222);

    expect(output).toBeUndefined();
  });

  test('returns the row id if something is found', async () => {
    query.mockResolvedValueOnce([{ id: 333 }]);

    const output = await db.findVzdLandIdByLatLng(56.123, 24.222);

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

describe('findVzdIdByCadastreNumber', () => {
  afterEach(jest.clearAllMocks);

  describe.each([
    ['building', 'house'],
    ['land', 'land'],
  ])('using %j category', (type, category) => {
    test('constructs the correct query', () => {
      db.findVzdIdByCadastreNumber('01000762043', category);

      expect(query).toBeCalled();
      expect(query.mock.calls[0][0]).toMatchSnapshot();
    });

    test('returns nothing if nothing found', async () => {
      query.mockResolvedValueOnce([]);

      const output = await db.findVzdIdByCadastreNumber(
        '01000762043',
        category,
      );

      expect(output).toEqual({});
    });

    test('returns the row id if something is found', async () => {
      query.mockResolvedValueOnce([{ id: 333 }]);

      const output = await db.findVzdIdByCadastreNumber(
        '01000762043',
        category,
      );

      expect(output).toEqual({ id: 333, type });
    });
  });
});
