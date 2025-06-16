async function getClientIP(headers) {
    try {
        return (
          headers['x-real-ip'] ||
          headers['cf-connecting-ip'] ||
          headers['x-client-ip'] ||
          headers['fastly-client-ip'] ||
          headers['true-client-ip'] ||
          headers['x-forwarded-for']?.split(',')[0].trim() ||
          headers['x-forwarded'] ||
          headers['x-cluster-client-ip'] ||
          headers['forwarded-for'] ||
          headers['forwarded'] ||
          headers['via'] ||
          null
        );
    }
    catch {
        return null;
    }
}

module.exports = getClientIP