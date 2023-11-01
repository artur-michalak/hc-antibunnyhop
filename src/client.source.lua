local isPedInSky = function (ped)
    return IsPedOnFoot(ped) and (IsPedRunning(ped) or IsPedSprinting(ped)) and IsPedJumping(ped) and not (IsPedSwimming(ped) or IsPedClimbing(ped) or IsPedRagdoll(ped))
end

CreateThread(function ()
    local lock = false
    while true do
        Wait(100)
        if not lock and isPedInSky(PlayerPedId()) then
            lock = true
            exports['hc-antibunnyhop']:jumpingObserver()
            lock = false
        end
    end
end)

exports('isPedInSky', isPedInSky)
