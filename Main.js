var http = require('http');
var socketio = require('socket.io');
var mysql = require('./SQL');

var server = http.createServer(function (req, res) {

}).listen(3000, function () {
    console.log('모바일 클라이언트 실행중');
});

// 소켓 서버를 생성한다.
var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
    console.log('Socket ID : ' + socket.id + ', Connect');
    //로그인 
    socket.on('Login', function (data) {
        console.log('email : ' + data.email);
        console.log('password: ' + data.password);

        var ErrMsg = {
            Name: 'none',
            ID: 'none'
        };

        var result = mysql.Login(data.email, data.password);
        console.log(result);
        if (result)
            socket.emit('serverMessage', result);
        else socket.emit('serverMessage', ErrMsg);
    });

    //운행정보 리스트
    socket.on('GetRunInfo', function (data) {
        var key = data.key;
        var Company = data.Company;
        var DriverID = data.DriverID;
        console.log(Company);

        var result = mysql.GetRunInfo(Company, DriverID, key);
        if (result)
            socket.emit('RunInfo', result);
        else
            socket.emit('RunInfo', 'Err');
    });

    //운행정보 각각
    socket.on('GetRunInfoByID', function (data) {
        var ID = data.RunInfoID;
        console.log("ID: " + ID);
        var result = mysql.GetRunInfoDetail(ID);
        console.log(result);
        if (result != null)
            socket.emit('RunInfoByID', result);
        else
            socket.emit('RunInfoByID', 'Err');
    });
    //우리회사 기사님
    socket.on('GetFreeDriver', function (data) {
        console.log("기사님 호출");ㅎ
        var CompanyID = data.CompanyID;
        var date = data.date;
        var cat=data.cat;
        var key=data.key;
        var result = mysql.GetFreeDrivers(CompanyID, date,cat, key);
        if (result != null)
            socket.emit('FreeDriver', result);
        else
            socket.emit('FreeDriver', 'Err');
    });
});

var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.set('views', './Views');

app.get('/Map', function (res, req) {
    res.render('Map', { 'title': '로그인' });
}); 