// 午前・午後の二つ
const NUM_TIMEFRAMES = 2;

const NUM_WEEKDAYS = 5;
const NUM_WEEKS = 5;

class Cell{

  constructor(row, column){
    this.row = row;
    this.column = column;
  }
  
}

const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

// WR名簿の利用者一覧の開始位置
const memberStartCell = new Cell(3, 1);

const userListSheet = spreadSheet.getSheetByName("WR名簿");

const createrSheet = spreadSheet.getActiveSheet();

const numAllUsers = userListSheet.getRange(memberStartCell.row, memberStartCell.column).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() - (memberStartCell.row - 1);

const userNameData = userListSheet.getRange(memberStartCell.row, memberStartCell.column, numAllUsers).getValues();

const idToUserName = userNameData.map(v => v[0]);

