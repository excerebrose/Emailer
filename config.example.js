// Example Config File 
// Replicate with necessary values as require

// Configuration options for server 

// const DB_USER= DATABASE_USERNAME;
// const DB_PWD= DATABASE_PASSWORD;

module.exports = {
    PORT: 3007,
    DB_URL: `mongodb://${DB_USER}:${DB_PWD}@ds141351.mlab.com:41351/travel_logs`,
};