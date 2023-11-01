const DEFAULT_VALUES = {
  maxRiskyJumps: 10,
  maxSafeJumps: 5,
  curve: 5,
  comboBreakTime: 5000,
} as {
  [key: string]: number;
};

const checkVariables = (variables: typeof DEFAULT_VALUES, defaults: number[]) =>
  Object.keys(variables).reduce(
    (dst, current, index) => ({
      ...dst,
      [current]: isNaN(variables[current])
        ? defaults[index]
        : variables[current],
    }),
    DEFAULT_VALUES
  );

const { maxRiskyJumps, maxSafeJumps, curve, comboBreakTime } = checkVariables(
  {
    maxRiskyJumps: parseInt(
      GetConvar("hc:abh:max_risky_jumps", `${DEFAULT_VALUES.max_risky_jumps}`)
    ),
    maxSafeJumps: parseInt(
      GetConvar("hc:abh:max_safe_jumps", `${DEFAULT_VALUES.maxSafeJumps}`)
    ),
    curve: parseInt(GetConvar("hc:abh:curve", `${DEFAULT_VALUES.curve}`)),
    comboBreakTime: parseInt(
      GetConvar("hc:abh:comboBreakTime", `${DEFAULT_VALUES.comboBreakTime}`)
    ),
  },
  Object.values(DEFAULT_VALUES)
);

const delay = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms, []));

const c = curve / 2;
const bp = (t: number) => {
  const s = t / maxRiskyJumps;
  return (
    (c * (s - s * s) + s * (c - s * c + s * maxRiskyJumps)) / maxRiskyJumps
  );
};

let isPedInSkyFn: Function

const jumpingObserver = async () => {
  isPedInSkyFn = isPedInSkyFn || exports["hc-antibunnyhop"].isPedInSky;

  return await new Promise<boolean>((resolve) => {
    let x = 0;
    let inJump = false;
    let breakComboTicket: CitizenTimer;

    const finalize = async () => {
      clearTimeout(breakComboTicket);
      clearTick(tickObserver);
      x = 0;
      const isPedOnGroundTicket = setTick(() => {
        if (!isPedInSkyFn(PlayerPedId()))
          clearTick(isPedOnGroundTicket);
      });
      resolve(true);
    };

    const breakCombo = () =>
      setTimeout(async () => await finalize(), comboBreakTime);

    const tickObserver = setTick(async () => {
      const ped = PlayerPedId();
      const isPedInSky = isPedInSkyFn(ped);

      if (inJump && !isPedInSky) inJump = false;
      else if (!inJump && isPedInSky) {
        if (breakComboTicket) clearTimeout(breakComboTicket);
        if (x > maxSafeJumps && Math.random() <= bp(x - maxSafeJumps)) {
          SetPedToRagdoll(ped, 5e3, 1400, 2, false, false, false);
          await finalize();
        } else ++x;

        if (x > 0) breakComboTicket = breakCombo();

        inJump = true;
      }
    });
  });
};

exports("jumpingObserver", jumpingObserver);
