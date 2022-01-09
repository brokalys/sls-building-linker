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

function updatePropertyBuildingId(propertyId, buildingId) {
  return mysql.query({
    sql: `
      UPDATE properties
      SET building_id = ?
      WHERE id = ?
   `,
    values: [buildingId, propertyId],
  });
}

function createPropertyBuildingLink(propertyId, buildingId, linkType) {
  return mysql.query({
    sql: `
      INSERT INTO property_building_links
      SET ?
   `,
    values: {
      vzd_building_id: buildingId,
      property_id: propertyId,
      link_type: linkType,
    },
  });
}

async function findBuildingIdByLatLng(lat, lng) {
  const distance = 0.0005;
  const data = await mysql.query({
    sql: `
      SELECT id, ST_DISTANCE(bounds, POINT(?, ?)) as distance
      FROM buildings
      WHERE MBRIntersects(bounds, LineString(Point(?, ?), Point(?, ?)))
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

async function findVzdBuildingIdByLatLng(lat, lng) {
  const distance = 0.0005;
  const data = await mysql.query({
    sql: `
      SELECT id, ST_DISTANCE(bounds, POINT(?, ?)) as distance
      FROM vzd_buildings
      WHERE MBRIntersects(bounds, LineString(Point(?, ?), Point(?, ?)))
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

async function findBuildingIdByLocation({ city, street, housenumber }) {
  const data = await mysql.query({
    sql: `
      SELECT id
      FROM buildings
      WHERE city = ?
        AND street = ?
        AND housenumber = ?
      ORDER BY id ASC
      LIMIT 1
   `,
    values: [city, street, housenumber],
  });

  if (data.length > 0) {
    return data[0].id;
  }
}

module.exports = {
  updatePropertyBuildingId,
  createPropertyBuildingLink,
  findBuildingIdByLatLng,
  findBuildingIdByLocation,
  findVzdBuildingIdByLatLng,
};
