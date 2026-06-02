/** Planning de relance — pur, testable. Stages : 1=J+7, 2=J+15, 3=J+30. */

export const REMINDER_THRESHOLDS: Record<number, number> = {
  1: 7,
  2: 15,
  3: 30,
};

/** Jours écoulés depuis une date (YYYY-MM-DD) jusqu'à `now`. */
export function daysSince(date: string, now: Date): number {
  const d = new Date(`${date}T00:00:00Z`);
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}

/**
 * Renvoie les stages de relance dus (seuil atteint) et non encore envoyés.
 */
export function dueReminderStages(
  daysOverdue: number,
  sentStages: number[],
): number[] {
  return Object.entries(REMINDER_THRESHOLDS)
    .filter(
      ([stage, threshold]) =>
        daysOverdue >= threshold && !sentStages.includes(Number(stage)),
    )
    .map(([stage]) => Number(stage));
}

/** Libellé d'un stage (pour l'email). */
export function reminderStageLabel(stage: number): string {
  return `relance ${stage} (J+${REMINDER_THRESHOLDS[stage] ?? "?"})`;
}
