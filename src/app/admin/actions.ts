'use server';

export async function verifyPassword(password: string) {
  // Leemos la variable secreta del servidor (SIN el prefijo NEXT_PUBLIC_)
  const adminPassword = process.env.ADMIN_PASSWORD || 'Rafael4k2024';
  
  // Agregamos un pequeño retraso artificial (delay) para prevenir ataques de fuerza bruta
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return password === adminPassword;
}
