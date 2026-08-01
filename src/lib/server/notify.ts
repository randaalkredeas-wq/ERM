import "server-only";

import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import type { NotificationTone } from "@/generated/prisma/enums";

/**
 * Creates the in-app notification and best-effort emails the same user.
 * A failed/unsent email never blocks the in-app notification or the
 * calling request - see sendMail().
 */
export async function notifyUser(
  userId: string,
  inApp: { title: string; description: string; tone: NotificationTone },
  email: { subject: string; html: string; text: string },
): Promise<void> {
  const [, user] = await Promise.all([
    prisma.notification.create({ data: { userId, ...inApp } }),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
  ]);

  if (user) {
    await sendMail({ to: user.email, ...email });
  }
}
