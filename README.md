# HC AntiBunnyhop

### Configuration

To change the configuration parameters, I recommend changing the parameters in the hc.conf file.

The script works in such way that with the number of jumps, the chance of the player ped losing balance increases.

The jumps counter resets when a player stops jumping for a period of time defined by `comboBreakTime` parameter.

The chance of losing balance is non-linear and is specified by the part of the graph above the line given by the formula
```math
s = x / m
```
```math
c = curve / 2
```
```math
f(x) = \frac{c(s-s^2)+s(c-sc+sm)}{m}
```
where m = maxRiskyJumps, x = number of risky jumps made, curve = the strength of the curvature

Parameter `maxSafeJumps` determines how many jumps can be safely made (it is possible that there is one more above this parameter).

### Usage steps

- download latest .zip release
- unpack files to resources/<resource_name> catalog e.g. resources/[standalone]/hc-antibunnyhop
- move hc.cfg from resource catalog to root of the server (same place where server.cfg is)
- in server.cfg set `ensure hc-antibunnyhop` to enable script and `exec hc.cfg` to setup configuration
- adjust configuration in hc.cfg to your needs

### Project build

#### required
- nodejs - current LTS version will be ok
- yarn

#### steps
- `git clone https://github.com/ArturMichalak/hc-antibunnyhop.git` or extract files from zip obtained by clicking  `Download ZIP` button 
- `yarn`
- `modify the parameters in a client.ts file`
- `yarn build`
