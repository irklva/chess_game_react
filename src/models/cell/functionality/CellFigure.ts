import {FigureModel, FigureNames} from "../../figures/FigureModel";
import {CellModel} from "./CellModel";
import {Colors} from "../../Colors";
import {BoardModel} from "../../board/functionality/BoardModel";
import {Move} from "../../interfaces/Move";
import {Pawn} from "../../figures/all/Pawn";
import {Rook} from "../../figures/all/Rook";
import {Bishop} from "../../figures/all/Bishop";
import {Knight} from "../../figures/all/Knight";
import {Queen} from "../../figures/all/Queen";
import {King} from "../../figures/all/King";

export class CellFigure {
    private object: FigureModel | null;
    private readonly cell: CellModel;
    private readonly board: BoardModel;

    constructor(cell: CellModel, board: BoardModel) {
        this.object = null;
        this.cell = cell;
        this.board = board;
    }

    isEnemy(target: CellModel): boolean {
        if (target.cellFigure.object) {
            return target.cellFigure.object.color !== this.object?.color;
        }
        return false;
    }

    noFigure(): boolean {
        return this.object === null;
    }

    private cellsPreparation(target: CellModel) {
        const figures: CellModel[] = [];
        let difX: string = "";
        let difY: string = "";
        this.board.cells.getModels.forEach(row => {
            row.forEach(cell => {
                cell.parameters.setMoveFrom = false;
                cell.parameters.setMoveTo = false;
                if (cell.cellFigure.object?.color === this.object?.color &&
                    cell.cellFigure.object?.getName === this.object?.getName &&
                    cell.cellFigure.object?.canMove(target, true) &&
                    cell !== this.cell
                ) {
                    figures.push(cell);
                }
            })
        })
        figures.some((figure) => {
            if (figure.parameters.coordinates.x !== this.cell.parameters.coordinates.x)
                difX = this.cell.parameters.coordinates.x;
            else
                difY = this.cell.parameters.coordinates.y;
            return (difX && difY);
        })
        return (difX + difY);
    }

    private moveFlags(target: CellModel, moveObject: Move) {
        if (target.cellFigure.object) {
            this.board.lostFigures.addLostFigure(target.cellFigure.object);
            moveObject.attack = true;
        }
        if (this.board.flags.getCastling) {
            moveObject.castling = this.board.flags.getCastling;
            this.board.flags.setCastling = null;
        }
        if (this.object?.getName === FigureNames.PAWN &&
            ((this.object?.color === Colors.WHITE &&
                    target.parameters.y === 0) ||
                (this.object?.color === Colors.BLACK &&
                    target.parameters.y === 7))) {
            this.board.flags.setPawnObject = {
                cell: target,
                moveObject: moveObject
            };
        }
    }

    private relocateObject(target: CellModel) {
        target.cellFigure.setObject = this.object;
        this.object = null;
    }

    public move(target: CellModel,
                blackTimer: number | null,
                whiteTimer: number | null) {
        if (this.object && target.parameters.getAvailable) {
            if (this.board.isDeepCopy) {
                const boardId = this.board.getId;
                this.board.moves.newMovesArray(this.board, boardId, Colors.BLACK);
                this.board.moves.newMovesArray(this.board, boardId, Colors.WHITE);
                this.board.notCopy();
            }
            const sameCoordinates = this.cellsPreparation(target);
            const moveObject: Move = {
                id: this.board.moves.black.length + 1,
                figure: this.object,
                to: sameCoordinates +
                    target.parameters.coordinates.x +
                    target.parameters.coordinates.y,
                attack: false,
                castling: null,
                board: null,
                blackTimer: blackTimer,
                whiteTimer: whiteTimer,
                promoFigure: null
            }
            this.object.moveFigure(target);
            this.moveFlags(target, moveObject);
            this.relocateObject(target);
            this.cell.parameters.setMoveFrom = true;
            target.parameters.setMoveTo = true;
            if (!this.board.flags.getPawnObject) {
                this.board.players.swipePlayer();
                this.board.checkAndMate.checkUpd();
                this.board.checkAndMate.stalemateAndMateUpd();
                moveObject.board = this.board.copyBoardDeep();
                this.board.moves.newMove = moveObject;
            }
        }
    }

    isMoveDangerousForKing(target: CellModel) {
        if (this.object) {
            const tempBoard = this.board.copyBoardModelForMoves();
            const newTargetModel = target.copy(tempBoard).cellModel;
            const newFigureModel = this.cell.copy(tempBoard).cellModel;
            if (newFigureModel.cellFigure.object) {
                newTargetModel.cellFigure.object = newFigureModel.cellFigure.object;
            }
            newFigureModel.cellFigure.object = null;
            tempBoard.cells.setModel(target.parameters.x, target.parameters.y, newTargetModel);
            tempBoard.cells.setModel(this.cell.parameters.x, this.cell.parameters.y, newFigureModel);
            if (this.object.getName === FigureNames.KING) {
                tempBoard.kings.kingMove(target, this.board.players.getCurrent.color);
            }
            tempBoard.checkAndMate.checkUpd();
            return this.board.players.getCurrent.color === Colors.BLACK
                ?
                tempBoard.checkAndMate.getBlackCheck
                :
                tempBoard.checkAndMate.getWhiteCheck
        }
    }

    public highLightMoveCells(resetAvailable: boolean) {
        this.board.cells.getModels.forEach(row => {
            row.forEach(cell => {
                cell.parameters.setAvailable = (!resetAvailable && !!this.object?.canMove(cell));
            })
        })
    }

    getCopyFigure(cell: CellModel) {
        switch (this.object?.getName) {
            case FigureNames.PAWN:
                return new Pawn(this.object.color, cell);
            case FigureNames.ROOK:
                return new Rook(this.object.color, cell);
            case FigureNames.BISHOP:
                return new Bishop(this.object.color, cell);
            case FigureNames.KNIGHT:
                return new Knight(this.object.color, cell);
            case FigureNames.QUEEN:
                return new Queen(this.object.color, cell);
            case FigureNames.KING:
                return new King(this.object.color, cell);
            default:
                return null
        }
    }

    get getObject() {
        return this.object;
    }

    set setObject(object: FigureModel | null) {
        this.object = object;
        if (this.object) {
            this.object.setCell = this.cell;
        }
    }
}