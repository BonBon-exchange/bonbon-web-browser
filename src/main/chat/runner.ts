import { v4 } from "uuid";
import { ChatRunner, ChatRunnerId } from "types/chat";
import { getStateAt, setStateAt } from "../BonBon_Global_State";

export const createRunner = (runnerInfo: ChatRunner): Promise<[ChatRunnerId, ChatRunner]> => {
    return new Promise((resolve, _reject) => {
        const runnerId = v4()
        setStateAt(`chat.runners.${runnerId}`, runnerInfo)
        setStateAt('chat.visibleRunner', runnerId)
        resolve([runnerId, runnerInfo])
    })
}

export const getRunner = (runnerId: ChatRunnerId) => {
    return getStateAt(`chat.runners.${runnerId}`)
}