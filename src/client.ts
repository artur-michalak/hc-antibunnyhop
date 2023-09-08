const DEFAULT_VALUES = { maxRiskyJumps: 10, maxSafeJumps: 5, curve: 5, comboBreakTime: 5000 } as {
  [key: string]: number;
};

const checkVariables = (variables: typeof DEFAULT_VALUES, defaults: number[]) =>
  Object.keys(variables).reduce(
    (dst, current, index) => ({ ...dst, [current]: isNaN(variables[current]) ? defaults[index] : variables[current] }),
    DEFAULT_VALUES
  );

const { maxRiskyJumps, maxSafeJumps, curve, comboBreakTime } = checkVariables(
  {
    maxRiskyJumps: parseInt(GetConvar("hc:abh:max_risky_jumps", `${DEFAULT_VALUES.max_risky_jumps}`)),
    maxSafeJumps: parseInt(GetConvar("hc:abh:max_safe_jumps", `${DEFAULT_VALUES.maxSafeJumps}`)),
    curve: parseInt(GetConvar("hc:abh:curve", `${DEFAULT_VALUES.curve}`)),
    comboBreakTime: parseInt(GetConvar("hc:abh:comboBreakTime", `${DEFAULT_VALUES.comboBreakTime}`)),
  },
  Object.values(DEFAULT_VALUES)
);

const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms, []));

const c = curve / 2;
const bp = (t: number) => {
  const s = t / maxRiskyJumps;
  return (c * (s - s * s) + s * (c - s * c + s * maxRiskyJumps)) / maxRiskyJumps;
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
