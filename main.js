function createRosterSheet(){

  let rosterName = createrSheet.getRange("B2").getValue();

  let date = createrSheet.getRange("C3").getValue();

  let numRoles = createrSheet.getRange("C4").getValue();

  let shouldAssignRoleInOrder = createrSheet.getRange("C5").getValue();

  let flagFirstRow = createrSheet.getRange("C8").getValue();

  let templateSheetName = createrSheet.getRange("C11").getValue();

  let templateSheet = spreadSheet.getSheetByName(templateSheetName);

  let scheduleSheet = spreadSheet.getSheetByName(`【予定表】${date.getMonth() + 1}月`);
  let lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  let scheduleData = getScheduleData(scheduleSheet, lastDate);

  let dateToDutyRequireFlagMap = getDateToDutyRequireFlagMap(scheduleSheet, scheduleData, lastDate);

  let dutyUserListBuilder = new DutyUserListBuilder(numRoles, new Cell(3, flagFirstRow));

  let rosterValuesBuilder = new RosterValuesBuilder(numRoles, dutyUserListBuilder, shouldAssignRoleInOrder, scheduleData, dateToDutyRequireFlagMap);

  fillInRosterSheet(templateSheet, date, rosterValuesBuilder, dutyUserListBuilder, numRoles, rosterName);

}

function getScheduleData(scheduleSheet, lastDate){

  let range = scheduleSheet.getRange(3, 3, numAllUsers * NUM_TIMEFRAMES + 1, lastDate);
  let scheduleData = range.getValues();

  return scheduleData;
} 

// その日が当番が必要かどうか
function getDateToDutyRequireFlagMap(scheduleSheet, scheduleData, lastDate){

  let dateBGList = scheduleSheet.getRange(3, 3, 1, lastDate).getBackgrounds()[0];
  let dateToDutyRequireFlagMap = new Map();
  
  for(let i = 0; i < lastDate; i++){
    let date = scheduleData[0][i];
    dateToDutyRequireFlagMap.set(date, dateBGList[i] === "#fbe4d5");
  }

  return dateToDutyRequireFlagMap;
}

// 当番表シートに書き込む
function fillInRosterSheet(templateSheet, date, rosterValuesBuilder, dutyUserListBuilder, numRoles, rosterName){

  // テンプレートをコピー
  let rosterSheet = templateSheet.copyTo(spreadSheet);
  
  // 月を記入
  rosterSheet.getRange("A2").setValue(date);

  // 名前一覧を記入
  let dutyUserNameList = dutyUserListBuilder.getDutyUserNameList();
  // [a,b,c]->[[a],[b],[c]]
  let dutyUserNameValues = dutyUserNameList.map(name => [name]);
  let nameListRange = rosterSheet.getRange(2, 9, dutyUserNameList.length, 1);
  nameListRange.setValues(dutyUserNameValues);

  // 当番表に記入
  let rosterSheetData = rosterValuesBuilder.getRosterValues();
  let rosterRange = rosterSheet.getRange(3, 3, (numRoles + 1) * NUM_WEEKS, NUM_WEEKDAYS);
  rosterRange.setValues(rosterSheetData);
  
  // 背景を変更
  rosterValuesBuilder.setNoDutyRangeBG(rosterSheet);

  // シート名を変更
  rosterSheet.setName(`【${rosterName}】${date.getMonth() + 1}月`);

}


