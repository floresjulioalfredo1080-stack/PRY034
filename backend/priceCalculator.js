const distance = require('@turf/distance').default;

/**
 * Calcula el precio basado en coordenadas
 * @param {Object} origin - {lat: number, lng: number}
 * @param {Object} destination - {lat: number, lng: number}
 * @param {Boolean} isExpress - Si es servicio express
 */
const calculatePrice = (origin, destination, isExpress) => {
    const from = [origin.lng, origin.lat];
    const to = [destination.lng, destination.lat];
    
    // Distancia en KM usando Turf
    const km = distance(from, to);
    
    // Lógica de Precios para el MVP
    const basePrice = 5.00;    // S/ 5.00 base
    const pricePerKm = 1.50;   // S/ 1.50 por km
    const expressSurcharge = isExpress ? 3.00 : 0; // S/ 3.00 extra si es express
    
    const totalPrice = basePrice + (km * pricePerKm) + expressSurcharge;
    
    return parseFloat(totalPrice.toFixed(2));
};

module.exports = calculatePrice;