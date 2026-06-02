import { describe, it, expect } from "vitest";
import { dueReminderStages, daysSince } from "./reminders";

describe("reminders", () => {
  it("daysSince compte les jours écoulés", () => {
    const now = new Date("2026-06-10T08:00:00Z");
    expect(daysSince("2026-06-03", now)).toBe(7);
    expect(daysSince("2026-06-10", now)).toBe(0);
  });

  it("déclenche J+7 au seuil", () => {
    expect(dueReminderStages(7, [])).toEqual([1]);
    expect(dueReminderStages(6, [])).toEqual([]);
  });

  it("ne renvoie que les stages non envoyés", () => {
    expect(dueReminderStages(16, [1])).toEqual([2]);
    expect(dueReminderStages(30, [1, 2])).toEqual([3]);
  });

  it("ne renvoie rien quand tout est envoyé", () => {
    expect(dueReminderStages(45, [1, 2, 3])).toEqual([]);
  });

  it("peut renvoyer plusieurs stages d'un coup", () => {
    expect(dueReminderStages(20, [])).toEqual([1, 2]);
  });
});
