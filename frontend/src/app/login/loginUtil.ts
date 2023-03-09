export async function hashPassword(password: string): Promise<string> {
  const utf8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
}
