/* eslint-disable no-shadow */
enum ActionTypes {
  INITIAL_FETCH = 'INITIAL_FETCH',
  CREATE_CARD = 'CREATE_CARD',
  EDIT_CARD = 'EDIT_CARD',
  DELETE_CARD = 'DELETE_CARD',
  DELETE_COLUMN = 'DELETE_COLUMN',
  EDIT_COLUMN = 'EDIT_COLUMN',
  MOVE_COLUMNS = 'MOVE_COLUMNS',
  MOVE_CARDS_SAME_COLUMN = 'MOVE_CARDS_SAME_COLUMN',
  MOVE_CARDS_BETWEEN_COLUMNS = 'MOVE_CARDS_BETWEEN_COLUMNS',
}

export default ActionTypes;
