import {resetTimers, setTimeMoment} from "../../../store/reducers/timers/timersReducer";
import {setNames} from "../../../store/reducers/players/playersReducer";
import {nameSymbolsLimit} from "../../../utils/newGameConstants";
import {useDispatch, useSelector} from "react-redux";
import {minutesConditions, secondsConditions, timerConditions} from "../../../utils/timerUtils";
import {useBoard} from "../../../board-context/useBoard";
import {setModalNewGame} from "../../../store/reducers/modal/modalsReducer";
import {
    getBlackNameInput,
    getMinutesInput, getNewTimer,
    getSecondsInput,
    getWhiteNameInput
} from "../../../store/reducers/new-game/newGameSelectors";

export const useNewGame = () => {
    const dispatch = useDispatch();
    const {boardSettings} = useBoard();
    const blackNameInput = useSelector(getBlackNameInput);
    const whiteNameInput = useSelector(getWhiteNameInput);
    const minutesInput = useSelector(getMinutesInput);
    const secondsInput = useSelector(getSecondsInput);
    const timer = useSelector(getNewTimer);

    return () => {

        const timerMs = timer ? (timer * 1000) : null;

        const gameSettings = () => {
            if (timerMs) {
                dispatch(setTimeMoment(new Date().getTime()));
            } else {
                dispatch(setTimeMoment(null));
            }
            dispatch(resetTimers(timerMs));
            dispatch(setNames({
                whiteName: whiteNameInput,
                blackName: blackNameInput
            }))
            dispatch(setModalNewGame(false));
        }

        const timeConditions = timerConditions(timer)
            && minutesConditions(minutesInput)
            && secondsConditions(secondsInput);

        const namesConditions = (whiteNameInput !== '' && whiteNameInput.length <= nameSymbolsLimit &&
            blackNameInput !== '' && blackNameInput.length <= nameSymbolsLimit);

        if (namesConditions && (timer === null || timeConditions)) {
            gameSettings();
            boardSettings();
        }
    }

}