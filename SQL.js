var mysqlSync = require('sync-mysql');
//연결 정보
var connection = new mysqlSync({
    host: 'localhost',
    user: 'ueue',
    password: 'Fucker0916!',
    port: '3306',
    database: 'BusLinker'
});

//로그인
exports.Login = function (ID, password) {
    //기사 ID로 먼저 로그인
    var query = `select ID, Name, cat from BusDrivers where ID='${ID}' and password='${password}'`;
    var result = connection.query(query)[0];
    //기사 ID 로그인 실패 시
    if (result == null) {  //회사 회원으로 로그인
        query = `select ID, Name, cat from BusCompany where ID='${ID}' and password='${password}'`;
        result = connection.query(query)[0];
    }
    return result;
}
//운행정보 전체 얻기
exports.GetRunInfo = function (Company, ID, key) {
    var dateFormat = require('dateformat');
        var date = new Date();
        var dateStr = dateFormat(date, 'yyyy-mm-dd');
    var query = '';
    
    if (Company) {
        //오늘이 계약 기간 내에 속한 것만 출력
        query = `select * from RunInfo where Company='${Company}'
        and '${dateStr}'<=ContractEnd
        and '${dateStr}'>=ContractStart`;
    } else if (ID) {
        //오늘 이후의 것만 출력    
        query = `select * from RunInfoEach RIE, RunInfo RI 
        where RIE.RunInfoID=RI.ID 
        and RIE.DriverID='${ID}'
        and RIE.RunDate>='${dateStr}'`;
    }

    if (key != null)
        query += ` and startAddr like '%${key}%' or endAddr like '%${key}%'`;
    var result = connection.query(query);
    console.log(result);
    return result;
}

//운행정보 상세
exports.GetRunInfoDetail = function (ID) {
    var query = `select * from RunInfo where ID=${ID}`;
    var result = connection.query(query)[0];
    return result;
};

//특정 날짜에 운행이 없는 우리회사의 기사님
exports.GetFreeDrivers = function (CompanyID, date, cat, key) {
    var query = `select distinct * from BusDrivers where CompanyID='${CompanyID}' and ID not in(select DriverID from RunInfoEach where RunDate='${date}')`;
    if (cat && key) {   //검색어 존재
        query += `and ${cat}='${key}'`;
    }
    var result = connection.query(query);
    return result;
}

//운행정보에 데이터 삽입
exports.CreateRunInfoEach = function (RunInfoID, DriverID, RunDate) {
    var query;
    var existQeury = `select count(*) as count
    from RunInfoEach where RunInfoID=${RunInfoID}
    and RunDate='${RunDate}'`;
    var exist = connection.query(existQeury)[0].count;   //기존 데이터 존재 여부
    if (exist == 0)
        query = `insert into RunInfoEach(RunInfoID, DriverID, RunDate) values(${RunInfoID}, '${DriverID}', '${RunDate}')`;
    else
        query = `update RunInfoEach set DriverID='${DriverID}'
        where RunInfoID=${RunInfoID} and RunDate='${RunDate}'`;

    var result = connection.query(query);
    return result;
};

//각 기사별 이전 운행기록 확인
exports.GetPrevRunInfo = function (DriverID, key) {
    var dateFormat = require('dateformat');
    var date = new Date();
    var dateStr = dateFormat(date, 'yyyy-mm-dd');
    query = `select * from RunInfoEach RIE, RunInfo RI 
        where RIE.RunInfoID=RI.ID 
        and RIE.DriverID='${DriverID}'
        and RIE.RunDate<'${dateStr}'`;

    if(key){
        query+=` and (
            RI.startAddr like'%${key}%'
            or RI.startName like'%${key}%'
            or RI.endName like '%${key}%'
            or RI.endAddr like '%${key}%'
            or RI.wayloadCats like '%${key}%'
            or RI.wayloadAddrs like '%${key}%'
            or RI.wayloadNames like '%${key}%')`
    }
    query+='order by RIE.RunDate desc';
    var result=connection.query(query);
    return result;
}