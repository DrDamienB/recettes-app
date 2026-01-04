"use server";

import {
  verifyPassword,
  generateDeviceFingerprint,
  getOrCreateDevice,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type LoginFormState = {
  success: boolean;
  error?: string;
  needsDeviceName?: boolean;
};

export async function loginAction(
  prevState: LoginFormState | null,
  formData: FormData
): Promise<LoginFormState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const deviceName = formData.get("deviceName") as string | null;

  if (!username || !password) {
    return {
      success: false,
      error: "Veuillez remplir tous les champs",
    };
  }

  // Vérifier le mot de passe
  const authResult = await verifyPassword(username, password);

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    };
  }

  // Générer le fingerprint de l'appareil
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "unknown";
  const fingerprint = generateDeviceFingerprint(userAgent);

  // Vérifier si c'est un nouvel appareil
  const { prisma } = await import("@/lib/prisma");
  const existingDevice = await prisma.device.findUnique({
    where: { fingerprint },
  });

  // Si nouvel appareil et pas de nom fourni, demander un nom
  if (!existingDevice && !deviceName) {
    return {
      success: false,
      needsDeviceName: true,
      error: "Veuillez nommer cet appareil",
    };
  }

  // Créer ou récupérer l'appareil
  const deviceId = await getOrCreateDevice(
    authResult.userId!,
    fingerprint,
    deviceName || undefined
  );

  // Créer la session
  const token = await createSession(authResult.userId!, deviceId);

  // Stocker dans un cookie
  await setSessionCookie(token);

  // Rediriger vers l'accueil
  redirect("/recipes");
}
