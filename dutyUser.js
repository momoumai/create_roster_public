class DutyUser{

  // 利用者id(メンバー一覧シートの並び順)、利用者名、担当可能な当番のリストをメンバ変数に持つ
  constructor(userId, userName, roleList){
    this.userId = userId;
    this.userName = userName;
    this.roleList = roleList;
  }

  // 次に担当する当番を返す
  getNextRoleNum(){
    return this.roleList[0];
  }

  // 担当した当番を一番後ろに移動させる
  assignRole(index, roleNum){
    this.roleList.splice(index, 1);
    this.roleList.push(roleNum);
  }

}