import { describe, expect, it } from "vitest";
import * as E from "@/lib/game/engine";

const countdown = () => ({ ...E.beginCountdown(E.initialState(0), 0), crashPoint: 3 });

describe("crash engine", () => {
  it("placing a bet deducts stake once and blocks duplicates", () => {
    const s = E.placeBet(countdown());
    expect(s.balance).toBe(900);
    expect(E.placeBet(s).balance).toBe(900);
  });
  it("no betting while running", () => {
    const s = E.startRound(countdown(), 0);
    expect(E.placeBet(s)).toBe(s);
  });
  it("cash out pays stake × multiplier once", () => {
    let s = E.startRound(E.placeBet(countdown()), 0);
    s = { ...s, multiplier: 2 };
    s = E.cashOut(s);
    expect(s.balance).toBe(1100);
    expect(E.cashOut(s).balance).toBe(1100);
  });
  it("crash before cash-out loses stake", () => {
    let s = E.startRound(E.placeBet(countdown()), 0);
    s = E.tick(s, E.timeToReach(3) + 10);
    expect(s.phase).toBe("CRASHED");
    expect(s.bet?.status).toBe("lost");
    expect(s.balance).toBe(900);
  });
  it("auto cash-out at 2.00x", () => {
    let s = E.startRound(E.placeBet({ ...countdown(), autoCash: true, autoTarget: 2 }), 0);
    s = E.tick(s, E.timeToReach(2.05));
    expect(s.bet?.status).toBe("cashed");
    expect(s.balance).toBe(1100);
  });
  it("stake cannot exceed balance", () => {
    expect(E.setStake(countdown(), 5000).stake).toBe(1000);
  });
  it("task reward claimable once", () => {
    const base = { ...countdown(), lastVisit: E.today() };
    const s = E.claimTask(base, "daily");
    expect(s.balance).toBe(1050);
    expect(E.claimTask(s, "daily").balance).toBe(1050);
  });
});
