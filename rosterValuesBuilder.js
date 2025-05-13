class RosterValuesBuilder{

  // 当番表の値を作成するクラス
  
  constructor(numRoles, dutyUserListBuilder, shouldAssignRolesInOrder, scheduleSheetData, dateToDutyRequireFragMap){
    
    this.numRoles = numRoles;
    this.dutyUserListBulider = dutyUserListBuilder;
    this.dutyUserList = dutyUserListBuilder.getDutyUserList();
    this.shouldAssignRolesInOrder = shouldAssignRolesInOrder;
    this.scheduleSheetData = scheduleSheetData;
    this.dateToDutyRequireFragMap = dateToDutyRequireFragMap;  

  }

  // 当番が必要ない日の範囲の背景色をグレー(#a8a8a8)にする
  setNoDutyRangeBG(rosterSheet){
    for(let row = 0; row < NUM_WEEKS * 3; row+=3){
      for(let column = 0; column < NUM_WEEKDAYS; column++){
          let date = this.rosterValues[row][column];
          if(date != undefined && !this.dateToDutyRequireFragMap.get(date)){
            rosterSheet.getRange(row + 3, column + 3, 3, 1).setBackground("#a8a8a8");
          }
      }
    }
  } 

  getRosterValues(){
    if(this.rosterValues == null){
      this.rosterValues = this.createRosterValues();
    }
    return this.rosterValues;
  }
  
  createRosterValues(){

    let rosterValueList = new Array(NUM_WEEKDAYS * NUM_WEEKS);
    rosterValueList.fill(new Array(this.numRoles + 1));

    let dateList = this.scheduleSheetData[0];

    let firstWeekOfDay = dateList[0].getDay(); // 0(日曜)~6(土曜)

    let rosterValueListIndex = Math.max(0, firstWeekOfDay % 6 - 1);

    dateList.forEach((date, column) => {
      
      // 土日の場合(日曜=0, 土曜=6)はとばす
      if(date.getDay() % 6 === 0) return;

      let assignedUserList = this.getAssignedUserList(date, column);

      let values = new Array(date).concat(assignedUserList);

      rosterValueList[rosterValueListIndex++] = values;

    });

    return this.processDataToSetValues(rosterValueList);
  }

  // 当番可能なユーザーを順に探して割り当てる
  getAssignedUserList(date, column){

    let assignedUserList = new Array(this.numRoles);

    // 当番が必要な場合
    if(this.dateToDutyRequireFragMap.get(date)){
      
      let assignedCount = 0;

      for(let dutyUserIndex = 0; dutyUserIndex < this.dutyUserList.length;){
          
        let dutyUser = this.dutyUserList[dutyUserIndex];
          
        let assignRoleNum = -1;
          
        // 午前午後どちらも通所
        if(this.isPresent(dutyUser.userId * NUM_TIMEFRAMES + 1, NUM_TIMEFRAMES, column)){
          assignRoleNum = this.getAssignRoleNum(dutyUser, assignedUserList);
        }
        
        // 割り当てられなかった場合
        if(assignRoleNum < 0){
           dutyUserIndex++;
           continue;
        }

        assignedUserList[assignRoleNum] = dutyUser.userName;

        // 一番後ろに移動
        this.dutyUserListBulider.moveDutyUserToEnd(dutyUserIndex);
              
        if(++assignedCount === this.numRoles) break;
      }
    }

    return assignedUserList;
  }

  // シート書き込み用の配列に加工
  processDataToSetValues(rosterValueList){
    
    let result = new Array();

    for(let week = 0; week < NUM_WEEKS; week++){

      // 値(日付, 当番)内の行
      for(let row = 0; row < (this.numRoles + 1); row++){
      
        let rowValues = new Array();
      
        for(let index = week * NUM_WEEKDAYS; index < week * NUM_WEEKDAYS + NUM_WEEKDAYS; index++){
          rowValues.push(rosterValueList[index][row]);
        }
      
        result.push(rowValues);
      }
    }
    return result;
  }

  // 割り当てられない場合は-1を返す
  getAssignRoleNum(dutyUser, assignedUserList){

    let assignRoleNum = -1;

    if(this.shouldAssignRolesInOrder){      
      
      // user内で役割を順番に割り当てる場合⇒userの次の役割が未割当ての場合に、その担当を割り当てる。

      if(assignedUserList[dutyUser.getNextRoleNum()] == undefined){
        assignRoleNum = dutyUser.getNextRoleNum();
        dutyUser.assignRole(0, assignRoleNum);
      }

    } else {

      // 交互に割り当てない場合

      for(let i = 0; i < dutyUser.roleList.length; i++){
        
        let roleNum = dutyUser.roleList[i];

        if(assignedUserList[roleNum] === undefined){
          assignRoleNum = roleNum;
          dutyUser.assignRole(i, assignRoleNum);
          break;
        }
      }
    }

    return assignRoleNum;
  }

  isPresent(firstRow, numOfRow, column){
    for(let i = 0; i < numOfRow; i++){
      if(this.scheduleSheetData[firstRow + i][column] != "通所") return false;
    }
    return true;
  }
}