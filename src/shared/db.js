const serverlessMysql = require('serverless-mysql');

const mysql = serverlessMysql({
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: 'Z',
    typeCast: true,
  },
});

function createPropertyBuildingLink(propertyId, buildingId, linkType) {
  return mysql.query({
    sql: `
      REPLACE INTO property_building_links
      SET ?
   `,
    values: {
      vzd_building_id: buildingId,
      property_id: propertyId,
      link_type: linkType,
    },
  });
}

function createPropertyLandLink(propertyId, landId, linkType) {
  return mysql.query({
    sql: `
      REPLACE INTO property_land_links
      SET ?
   `,
    values: {
      vzd_land_id: landId,
      property_id: propertyId,
      link_type: linkType,
    },
  });
}

async function findVzdBuildingIdByLatLng(lat, lng) {
  const distance = 0.0005;
  const data = await mysql.query({
    sql: `
      SELECT id, ST_DISTANCE(bounds, POINT(?, ?)) as distance
      FROM vzd_buildings
      WHERE MBRIntersects(bounds, LineString(Point(?, ?), Point(?, ?)))
      AND is_usable = 1
      ORDER BY distance ASC
      LIMIT 1
   `,
    values: [
      lat,
      lng,
      lat - distance,
      lng - distance,
      lat + distance,
      lng + distance,
    ],
  });

  if (data.length) {
    return data[0].id;
  }
}

async function findVzdLandIdByLatLng(lat, lng) {
  const distance = 0.0005;
  const data = await mysql.query({
    sql: `
      SELECT id, ST_DISTANCE(bounds, POINT(?, ?)) as distance
      FROM vzd_land
      WHERE MBRIntersects(bounds, LineString(Point(?, ?), Point(?, ?)))
      AND is_usable = 1
      ORDER BY distance ASC
      LIMIT 1
   `,
    values: [
      lat,
      lng,
      lat - distance,
      lng - distance,
      lat + distance,
      lng + distance,
    ],
  });

  if (data.length) {
    return data[0].id;
  }
}

async function findVzdBuildingIdByLocation({ city, street, housenumber }) {
  const data = await mysql.query({
    sql: `
      SELECT id
      FROM vzd_buildings
      WHERE is_usable = 1
        AND city = ?
        AND street = ?
        AND house_number = ?
      ORDER BY id ASC
      LIMIT 1
   `,
    values: [city, street, housenumber],
  });

  if (data.length > 0) {
    return data[0].id;
  }
}

async function findVzdIdByCadastreNumber(cadastreNumber, type) {
  const useBuildingsTable = type === 'house';

  const data = await mysql.query({
    sql: `
      SELECT id
      FROM ${useBuildingsTable ? 'vzd_buildings' : 'vzd_land'}
      WHERE is_usable = 1
        AND cadastral_designation = ?
      ORDER BY id ASC
      LIMIT 1
   `,
    values: [cadastreNumber],
  });

  if (data.length > 0) {
    return { id: data[0].id, type: useBuildingsTable ? 'building' : 'land' };
  }

  return {};
}

module.exports = {
  createPropertyBuildingLink,
  createPropertyLandLink,
  findVzdLandIdByLatLng,
  findVzdBuildingIdByLatLng,
  findVzdBuildingIdByLocation,
  findVzdIdByCadastreNumber,
};
