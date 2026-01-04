import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "recettes_session";
const SESSION_DURATION_MONTHS = 6;

// Générer un fingerprint d'appareil basé sur user-agent
export function generateDeviceFingerprint(userAgent: string): string {
  return crypto.createHash("sha256").update(userAgent).digest("hex");
}

// Vérifier le mot de passe
export async function verifyPassword(
  username: string,
  password: string
): Promise<{ success: boolean; userId?: number; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { success: false, error: "Utilisateur non trouvé" };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return { success: false, error: "Mot de passe incorrect" };
  }

  return { success: true, userId: user.id };
}

// Créer ou récupérer un appareil
export async function getOrCreateDevice(
  userId: number,
  fingerprint: string,
  deviceName?: string
): Promise<number> {
  // Chercher si l'appareil existe déjà
  let device = await prisma.device.findUnique({
    where: { fingerprint },
  });

  if (!device) {
    // Créer un nouvel appareil
    device = await prisma.device.create({
      data: {
        userId,
        fingerprint,
        deviceName: deviceName || "Appareil inconnu",
      },
    });
  } else {
    // Mettre à jour la dernière connexion
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });
  }

  return device.id;
}

// Créer une session
export async function createSession(
  userId: number,
  deviceId: number
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + SESSION_DURATION_MONTHS);

  await prisma.session.create({
    data: {
      userId,
      deviceId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Stocker le token dans un cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + SESSION_DURATION_MONTHS);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

// Récupérer la session courante
export async function getCurrentSession(): Promise<{
  userId: number;
  deviceId: number;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      User: true,
      Device: true,
    },
  });

  if (!session) {
    return null;
  }

  // Vérifier si la session n'est pas expirée
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return {
    userId: session.userId,
    deviceId: session.deviceId,
  };
}

// Déconnexion
export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Révoquer un appareil (supprime toutes ses sessions)
export async function revokeDevice(deviceId: number) {
  await prisma.session.deleteMany({ where: { deviceId } });
  await prisma.device.delete({ where: { id: deviceId } });
}

// Changer le mot de passe
export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { success: false, error: "Utilisateur non trouvé" };
  }

  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!isValid) {
    return { success: false, error: "Ancien mot de passe incorrect" };
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return { success: true };
}
