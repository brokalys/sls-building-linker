const addressParser = require('@brokalys/address-normalization');
const db = require('./shared/db');

exports.run = async (event) => {
  const classifieds = event.Records.map((row) => JSON.parse(row.body));
  const eligibleClassifieds = classifieds.filter(
    (classified) =>
      (!classified.location_country ||
        classified.location_country === 'Latvia') &&
      ['apartment', 'house', 'office'].includes(classified.category),
  );

  // Link by address
  await Promise.all(
    eligibleClassifieds.map(async (classified) => {
      const location = addressParser(classified);

      if (!location.city || !location.street || !location.housenumber) {
        return;
      }

      const buildingId = await db.findVzdBuildingIdByLocation(location);

      if (!buildingId) {
        return;
      }

      return db.createPropertyBuildingLink(
        classified.id,
        buildingId,
        'address',
      );
    }),
  );

  // Link by lat/lng
  await Promise.all(
    eligibleClassifieds.map(async (classified) => {
      if (!classified.lat || !classified.lng) {
        return;
      }

      const buildingId = await db.findVzdBuildingIdByLatLng(
        classified.lat,
        classified.lng,
      );

      if (!buildingId) {
        return;
      }

      return db.createPropertyBuildingLink(classified.id, buildingId, 'latlng');
    }),
  );

  // Link "land" classifieds by lat/lng
  await Promise.all(
    classifieds
      .filter(
        (classified) =>
          (!classified.location_country ||
            classified.location_country === 'Latvia') &&
          classified.category === 'land',
      )
      .filter((classified) => !!classified.lat && !!classified.lng)
      .map(async (classified) => {
        const plotId = await db.findVzdPlotIdByLatLng(
          classified.lat,
          classified.lng,
        );

        if (!plotId) {
          return;
        }

        return db.createPropertyPlotLink(classified.id, plotId, 'latlng');
      }),
  );
};
