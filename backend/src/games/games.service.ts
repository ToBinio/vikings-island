import {GameInfo} from "../../../types/games";
import {getAllGames} from "./games.store";

export function getAllGameInfos(): GameInfo[] {
    return getAllGames();
}