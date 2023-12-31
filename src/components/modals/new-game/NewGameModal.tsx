import React, {FC} from 'react';
import st from "./new-game.module.css";
import ModalWindow from "../ModalWindow";
import {useDispatch, useSelector} from "react-redux";
import TimerSettings from "./timer-settings/TimerSettings";
import PlayerSettings from "./player-settings/PlayerSettings";
import {useNewGame} from "./useNewGame";
import {getModalNewGame} from "../../../store/reducers/modal/modalsSelectors";
import {
    getBlackNameInput,
    getInfiniteSeconds,
    getWhiteNameInput
} from "../../../store/reducers/new-game/newGameSelectors";
import {
    setBlackNameInput,
    setInfiniteSeconds,
    setWhiteNameInput
} from "../../../store/reducers/new-game/newGameReducer";

const NewGameModal: FC = () => {
    const dispatch = useDispatch();
    const modalNewGame = useSelector(getModalNewGame);
    const blackNameInput = useSelector(getBlackNameInput);
    const whiteNameInput = useSelector(getWhiteNameInput);
    const infiniteSeconds = useSelector(getInfiniteSeconds);

    const setNewBlackName = (newName: string) => {
        dispatch(setBlackNameInput(newName));
    }

    const setNewWhiteName = (newName: string) => {
        dispatch(setWhiteNameInput(newName));
    }

    const newGame = useNewGame();

    return (
        <ModalWindow
            show={modalNewGame}
            setShow={null}
            title={'New game'}
            action={newGame}
            btnName={'Start'}
            closeBtn={false}
        >
            <PlayerSettings
                inputId="blackPlayer"
                newNameLabel="Black player:"
                newName={blackNameInput}
                setNewName={setNewBlackName}
            />
            <PlayerSettings
                inputId="whitePlayer"
                newNameLabel="White player:"
                newName={whiteNameInput}
                setNewName={setNewWhiteName}
            />
            <div className={st.checkbox}>
                <label htmlFor="infiniteSeconds">
                    <div className={st.name}>
                        Infinite timers
                    </div>
                    <input id="infiniteSeconds" type="checkbox" checked={infiniteSeconds}
                           onChange={() => dispatch(setInfiniteSeconds())}/>
                    <span></span>
                </label>
            </div>
            {!infiniteSeconds &&
                <TimerSettings/>
            }
        </ModalWindow>
    );
};

export default NewGameModal;