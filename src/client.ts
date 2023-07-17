const maxRiskyJumps = 10,
  maxSafeJumps = 5,
  curve = 5,
  comboBreakTime = 5000;

const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms, []));

const c = curve / 2;
const bp = (t: number) => {
  const s = t / maxRiskyJumps;
  return (c * ( s - s * s) + s * (c - s * c + s * maxRiskyJumps)) / maxRiskyJumps;
};

const jumpingObserver = async () => {
  return await new Promise((resolve) => {
    let x = 0;
    let breakComboTimeout: CitizenTimer;

    const finalize = async () => {
      clearTimeout(breakComboTimeout);
      clearTick(tickObserver);
      x = 0;
      await delay(500);
      resolve(true);
    };

    const breakComboTimeoutFunc = () =>
      setTimeout(async () => {
        await finalize();
      }, comboBreakTime);

    const tickObserver = setTick(async () => {
      const player = PlayerPedId();
      await delay(500);

      if (
        IsPedOnFoot(player) &&
        (IsPedRunning(player) || IsPedSprinting(player)) &&
        IsPedJumping(player) &&
        !(IsPedSwimming(player) || IsPedClimbing(player) || IsPedRagdoll(player))
      ) {
        if (breakComboTimeout) clearTimeout(breakComboTimeout);
        if (x > maxSafeJumps && Math.random() <= bp(x - maxSafeJumps)) {
          SetPedToRagdoll(player, 5e3, 1400, 2, false, false, false);
          await finalize();
        } else ++x;

        if (x > 0) breakComboTimeout = breakComboTimeoutFunc();
      }
    });
  });
};

setTick(async () => {
  await jumpingObserver();
  await delay(1000);
});
