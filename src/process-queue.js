const db = require('./shared/db');
const addressParser = require('./shared/address-parser');

exports.run = async (event) => {
  const classifieds = event.Records.map((row) => JSON.parse(row.body));

  // Link by location string
  const unlinkedClassifieds = await Promise.all(
    classifieds.filter(async (classified) => {
      const location = addressParser(classified);

      if (!location.city || !location.street || !location.housenumber) {
        return true;
      }

      const buildingId = await db.findBuildingIdByLocation(location);

      if (!buildingId) {
        return true;
      }

      await db.updatePropertyBuildingId(classified.id, buildingId);
      return false;
    }),
  );

  // Link by lat/lng
  await Promise.all(
    unlinkedClassifieds
      .filter(
        (classified) =>
          classified.lat &&
          classified.lng &&
          (!classified.location_country ||
            classified.location_country === 'Latvia'),
      )
      .map(async (classified) => {
        const buildingId = await db.findBuildingIdByLatLng(
          classified.lat,
          classified.lng,
        );

        if (!buildingId) {
          return;
        }

        return db.updatePropertyBuildingId(classified.id, buildingId);
      }),
  );
};
