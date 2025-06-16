export async function getClientIP(headers: any) {
    return (
      headers.get['x-real-ip'] ||
      headers.get['cf-connecting-ip'] ||
      headers.get['x-client-ip'] ||
      headers.get['fastly-client-ip'] ||
      headers.get['true-client-ip'] ||
      headers.get['x-forwarded-for']?.split(',')[0].trim() ||
      headers.get['x-forwarded'] ||
      headers.get['x-cluster-client-ip'] ||
      headers.get['forwarded-for'] ||
      headers.get['forwarded'] ||
      headers.get['via'] ||
      null
    );
}