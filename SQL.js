var mysqlSync=require('sync-mysql');
//연결 정보
var connection=new mysqlSync({
    host: 'localhost',
    user: 'ueue',
    password: 'Fucker0916!',
    port: '3306',
    database: 'BusLinker'
});

//로그인
exports.Login=function(ID, password) {
    //기사 ID로 먼저 로그인
    var query=`select ID, Name, cat from BusDrivers where ID='${ID}' and password='${password}'`;
    var result=connection.query(query)[0];
    //기사 ID 로그인 실패 시
    if(result==null) {  //회사 회원으로 로그인
        query=`select ID, Name, cat from BusCompany where ID='${ID}' and password='${password}'`;
        result=connection.query(query)[0];
    }
    return result;
}
//운행정보 전체 얻기
exports.GetRunInfo=function(Company, ID, key) {
    var query='';
    if(Company) {
        query=`select * from RunInfo where Company='${Company}'`;
    } else if(ID) {
        query=`select * from RunInfoEach RIE, RunInfo RI where RIE.RunInfoID=RI.ID and RIE.DriverID='${ID}'`
    }
    
    if(key!=null)
        query+=` and startAddr like '%${key}%' or endAddr like '%${key}%'`;
    var result=connection.query(query);
    console.log(result);
    return result;
}

//운행정보 상세
exports.GetRunInfoDetail=function(Company) {
    var query=`select * from RunInfo where Company='${Company}'`;
    var result=connection.query(query)[0];
    return result;
};