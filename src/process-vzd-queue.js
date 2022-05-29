const addressParser = require('@brokalys/address-normalization');
const cadastreNumberNormalizer = require('./shared/cadastre-number-normalizer');
const db = require('./shared/db');

const IGNORED_COORDINATES = [
  [56, 24], // Default coordinates for ober-haus.lv
  [57.15194, 24.86472], // Default coordinates for sigulda.lv
  [56.9496487, 24.1051865], // Default coordinates for various sources
];

function isIgnoredCoords(lat, lng) {
  return !!IGNORED_COORDINATES.find(
    ([ignoredLat, ignoredLng]) => ignoredLat === lat && ignoredLng === lng,
  );
}

exports.run = async (event) => {
  const classifieds = event.Records.map((row) => JSON.parse(row.body));
  const eligibleClassifieds = classifieds.filter((classified) =>
    ['apartment', 'house', 'office'].includes(classified.category),
  );

  // Link by cadastre_number
  await Promise.all(
    classifieds
      .filter((classified) => ['house', 'land'].includes(classified.category))
      .filter((classified) => classified.cadastre_number)
      .map(async (classified) => {
        const cadastreNumber = cadastreNumberNormalizer(
          classified.cadastre_number,
        );

        if (!cadastreNumber) {
          return;
        }

        const { id: estateId, type } = await db.findVzdIdByCadastreNumber(
          cadastreNumber,
          classified.category,
        );

        if (!estateId) {
          return;
        }

        if (type === 'land') {
          return db.createPropertyLandLink(classified.id, estateId, 'cadnum');
        }

        return db.createPropertyBuildingLink(classified.id, estateId, 'cadnum');
      }),
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

      if (isIgnoredCoords(classified.lat, classified.lng)) {
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
      .filter((classified) => classified.category === 'land')
      .filter((classified) => !!classified.lat && !!classified.lng)
      .filter((classified) => !isIgnoredCoords(classified.lat, classified.lng))
      .map(async (classified) => {
        const landId = await db.findVzdLandIdByLatLng(
          classified.lat,
          classified.lng,
        );

        if (!landId) {
          return;
        }

        return db.createPropertyLandLink(classified.id, landId, 'latlng');
      }),
  );
};
