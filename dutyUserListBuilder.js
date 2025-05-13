class DutyUserListBuilder{

// DutyUserの配列を作成するクラス

  constructor(numRoles, canRoleStartCell){ 

    // 役割の数
    this.numRoles = numRoles;

    // 役割が可能かどうかのリストを取得
    this.canPlayRoleList = userListSheet.getRange(canRoleStartCell.row, canRoleStartCell.column, numAllUsers, numRoles).getValues();

  }

  createDutyUserList(){

    let dutyUserIdList = this.getDutyUserIdList();
    let dutyUserList = new Array(dutyUserIdList.length);
    dutyUserIdList.forEach((userId, index) => {
      dutyUserList[index] = new DutyUser(userId, idToUserName[userId], this.createUserRoleList(userId, index));
    });

    // 毎月同じ順にならないようにシャッフルする
    return this.shuffleArray(dutyUserList); 
  }

  getDutyUserList(){
    if(this.dutyUserList == null){
      this.dutyUserList = this.createDutyUserList();
    }
    return this.dutyUserList;
  }

  // index番目のDutyUserを一番後ろに移動させる
  moveDutyUserToEnd(index){
    this.dutyUserList.push(this.dutyUserList.splice(index, 1)[0]);
  }

  getDutyUserNameList(){

    if(this.dutyUserNameList == null){
      this.dutyUserNameList = this.getDutyUserIdList().map(userId => idToUserName[userId]);
    }

    return this.dutyUserNameList;
  }

  // 利用者ごとの担当が可能な当番のリスト
  createUserRoleList(userId, index){

    let roleList = new Array();
    
    for(let i = 0; i < this.numRoles; i++){
      // 利用者ごとに役割リストの並び順をずらす
      let roleNum = (index + i) % this.numRoles;
      if(this.canPlayRoleList[userId][roleNum]){
        roleList.push(roleNum);
      }
    }

    return roleList;
  }

  // 1つ以上の当番を担当できる利用者のidリストを取得
  getDutyUserIdList(){

    if(this.dutyUserIdList == null){

      this.dutyUserIdList = new Array();

      for(let userId = 0; userId < numAllUsers; userId++){

        if(this.canPlayAnyRole(userId)){
          this.dutyUserIdList.push(userId);
        }
      }
    }

    return this.dutyUserIdList;
  }

  // 利用者がいずれかの当番が可能であるか
  canPlayAnyRole(userId){

    for(let i = 0; i < this.numRoles; i++){
      if(this.canPlayRoleList[userId][i]){
        return true;
      }
    }
    return false;
  }

  shuffleArray(originalArray){  

    let shuffledArray = new Array();

    for(let length = originalArray.length; length > 0; length--){
      let randomIndex = Math.floor(Math.random() * length);
      shuffledArray.push(originalArray[randomIndex]);
      originalArray.splice(randomIndex, 1);
    }

    return shuffledArray;
  } 
}


