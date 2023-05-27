async function init_bt() {
    async function sendPacket(packet) {
        const writer = bt_port.writable.getWriter(); // 取得寫入器
        await writer.write(packet); // 寫入封包
        await writer.releaseLock(); // 釋放寫入器鎖定
    }

    if (bt_open_flag == false) {
        let reader = null;
        bt_open_flag = true;
        try {
            bt_port = null;
            const baudRate = document.querySelector("#baund_rate_select").options[document.querySelector("#baund_rate_select").selectedIndex].text; //取得BaundRate
            bt_port = await navigator.serial.requestPort();
            
            if (!bt_port && !bt_port.readable) await bt_port.close();
            if (!bt_port.opened) await bt_port.open({ baudRate });
            
            add_log('Selected serial port:' + bt_port.name);
            add_log("baudRate:"+baudRate);
            add_log("正在接收資料");

            document.querySelector('#bt_btn').src = "images/disconnect_bt.png";

            reader = bt_port.readable.getReader();
            while (bt_open_flag) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log('Serial port closed');
                    break;
                }
                
                let data = "";
                switch(bt_data_flag){
                    case 0: //初始狀態，接收所有路線資料
                        receive_bt_allPathData(value);
                        
                        if(allPathDataOk == true){
                            console.log(btAllPathData);
                            data = btAllPathData;
                            data = handel_bt_allPathData(data);
                            if(data != null){                            
                                await draw_allPath(data);
                                bt_data_flag = 1;
                                const packet = new Uint8Array([0x23, 0x26]); // 要發送的封包資料
                                await sendPacket(packet);
                            }
                            btAllPathData = "";
                        }
                        
                        break;
                    case 1: //投點狀態，接收當前位置資料
                        receive_bt_offsetData(value);   //接收offset資料
                        data = btOffsetDate;
                        if(data.length >= 64){
                            console.log("原始資料:"+data);
                            data = handle_bt_offsetData_to_list(data);
                            if(data != -1) {
                                serial_monitor(data);
                                await draw_cell(data);
                            }
                        }
                        break;
                }
            }
        } catch (error) {
            alert('Error opening serial port:' + error + '\n' + "請檢查藍牙與Baund Rate是否正確");
        } finally {
            try {
              await reader.cancel(); // 等待讀取器取消鎖定
            } catch (error) {
                console.error('Error cancelling reader: ' + error);
            }
            if (bt_port && bt_port.readable) {
                try {
                    await bt_port.close(); // 關閉 port
                } catch (error) {
                    console.error('Error closing port: ' + error);
                }
            }
        }
    } else if (bt_open_flag == true) {
        bt_open_flag = false;
        document.querySelector('#bt_btn').src = "images/bt.png";
    }
}

let btAllPathData = "";
let allPathDataOk = false;
function receive_bt_allPathData(value){
    value = Array.from(new Uint8Array(value)).map((b) => b.toString(16).padStart(2, '0')).join(''); // 轉換為 16 進制字串並補零
    btAllPathData += value;

    let hightStart = btAllPathData.indexOf('23'), lowStart = btAllPathData.indexOf('24'), hightEnd = btAllPathData.indexOf('25'), lowEnd = btAllPathData.indexOf('26'); 
    let hightEndArray = new Array();


    while (hightEnd !== -1) {
        hightEndArray.push(hightEnd);
        hightEnd = btAllPathData.indexOf('25', hightEnd + 1);
    }

    console.log(hightEndArray);

    if(lowStart - hightStart == 2){
        for(var i = 0; i < hightEndArray.length; i++){
            if(btAllPathData.substring(hightEndArray[i], hightEndArray[i]+2) == '25' && btAllPathData.substring(hightEndArray[i] + 2, hightEndArray[i]+4) == '26'){
                lowEnd = hightEndArray[i]+4;
                
            }
        }
        
        btAllPathData = btAllPathData.substring(hightStart, lowEnd);
        allPathDataOk = true;
    }
}

function handel_bt_allPathData(value){
    const sum = parseInt(value.substring(4,6), 16);   //資料總筆數
    if(sum > 0){
        console.log("sum:"+sum);
        let data_temp_list = new Array();
        for(var i = 0; i < sum; i++){
            let startIndex = 6 + 32 * i, endIndex = 38 + 32 * i;
            const cell_str = value.substring(startIndex, endIndex);
            const cell = {
                "sp":{
                    "lat": parseInt(cell_str.substring(0, 8), 16) / 1000000,
                    "lon": parseInt(cell_str.substring(8, 16), 16) / 1000000,
                },
                "ep":{
                    "lat": parseInt(cell_str.substring(16, 24), 16) / 1000000,
                    "lon": parseInt(cell_str.substring(24, 32), 16) / 1000000,
                }
            };
            data_temp_list.push(cell);
        }
        console.log(data_temp_list);
        return data_temp_list;
    }else{
        alert("沒有數據!");
        return null;
    } 
}

function draw_allPath(cell){
    for(var i=0; i<cell.length; i++){
        let path = new Array();
        path.push(cell[i].sp);
        path.push(cell[i].ep);

        let polyline = L.polyline(path, { color: 'blue' }).addTo(map);
        var arrow = L.polylineDecorator(polyline, {
            patterns: [
                {
                    offset: "100%",
                    repeat: 0,
                    symbol: L.Symbol.arrowHead({
                    pixelSize: 12,
                    polygon: false,
                    pathOptions: { stroke: true, color: "blue" },
                    }),
                },
            ],
        }).addTo(map);
    
        path = null;
    }
}

let btOffsetDate = '';
let A5_flag = 0;    //0:有AA有55，1:有AA沒55
function receive_bt_offsetData(value) {
    value = Array.from(new Uint8Array(value)).map((b) => b.toString(16).padStart(2, '0')).join(''); // 轉換為 16 進制字串並補零
    let startIndex = value.indexOf("aa"), endIndex = value.indexOf("55");
    if(A5_flag == 0){
        if(startIndex >= 0 && endIndex >= 0){   //有AA有55
            btOffsetDate = value.substring(startIndex, endIndex+2);
            //console.log(btOffsetDate);
        }else if(startIndex >= 0 && endIndex < 0){ //有AA沒55
            A5_flag = 1;
            btOffsetDate = value.substring(startIndex, 64);
            //console.log(btOffsetDate);
        }
    }else if(A5_flag == 1){
        if(startIndex < 0 && endIndex >= 0){
            btOffsetDate += value.substring(0, endIndex+2);
            A5_flag = 0;
        }
    }
}

function handle_bt_offsetData_to_list(value) {
    const start = parseInt(value.substring(0, 2), 16);
    const end = parseInt(value.substring(62, 64), 16);
    const check_sum = parseInt(value.substring(60, 62), 16);

    let proc_check_sum = 0;
    for (let i = 2; i < 59; i += 2) {
        let byte = parseInt(value.substring(i, i + 2), 16);
        proc_check_sum ^= byte;
    }

    if (start === 170 && end === 85 && proc_check_sum === check_sum) {  //資料的封包首:AA，封包尾:55，轉換為十進制分別為170與85
        const cell = {
            "yp": {
                "lat": parseInt(value.substring(2, 10), 16) / 1000000,
                "lon": parseInt(value.substring(10, 18), 16) / 1000000
            },
            "sp": {
                "lat": parseInt(value.substring(18, 26), 16) / 1000000,
                "lon": parseInt(value.substring(26, 34), 16) / 1000000
            },
            "ep": {
                "lat": parseInt(value.substring(34, 42), 16) / 1000000,
                "lon": parseInt(value.substring(42, 50), 16) / 1000000
            },
            "dist_offset": parseInt(value.substring(50, 54), 16) << 16 >> 16,
            "nsew": parseInt(value.substring(54, 56), 16),
            "cursor_offset": parseInt(value.substring(56, 60), 16) << 16 >> 16,
        };

        return cell;
    }
    return -1;
}

async function draw_cell(cell){
    let path = new Array();
    path.push(cell.sp);
    path.push(cell.ep);
    //console.log(path);
    
    let polyline = L.polyline(path, { color: 'green' }).addTo(map);
    // 添加箭頭樣式
    var arrow = L.polylineDecorator(polyline, {
        patterns: [
            {
                offset: "100%",
                repeat: 0,
                symbol: L.Symbol.arrowHead({
                pixelSize: 12,
                polygon: false,
                pathOptions: { stroke: true, color: "green" },
                }),
            },
        ],
    }).addTo(map);

    
    //if(sp_marker != null) sp_marker.remove();   //移除標註使用者座標
    //sp_marker = L.marker(cell.sp, { icon: sp_icon }).addTo(map); //新增標註使用者座標
    
    if(yp_marker != null) yp_marker.remove();   //移除標註使用者座標
    yp_marker = L.marker(cell.yp, { icon: yp_icon }).addTo(map); //新增標註使用者座標

    //if(ep_marker != null) ep_marker.remove();   //移除標註使用者座標
    //ep_marker = L.marker(cell.ep, { icon: ep_icon }).addTo(map); //新增標註使用者座標

    path = null;
}

function serial_monitor(cell){
    let text = document.querySelector(".監看視窗文字");
    text.innerHTML = "SP:("+cell.sp.lat+","+cell.sp.lon+")<br>"
                    +"EP:("+cell.ep.lat+","+cell.ep.lon+")<br>"
                    +"YP:("+cell.yp.lat+","+cell.yp.lon+")<br>"
                    +"Dist Offset:"+cell.dist_offset+"<br>"
                    +"Cursor Offset:"+cell.cursor_offset ;

    JJ_log_file += "SP:("+cell.sp.lat+","+cell.sp.lon+") , "
                    +"EP:("+cell.ep.lat+","+cell.ep.lon+") , "
                    +"YP:("+cell.yp.lat+","+cell.yp.lon+") , "
                    +"Dist Offset:"+cell.dist_offset+" , "
                    +"Cursor Offset:"+cell.cursor_offset+"\n";
}

function open_popup(){
    let monitor = document.querySelector(".監看視窗");
    let opacity = window.getComputedStyle(monitor).opacity;
    if(opacity == 0){
        monitor.style.opacity = 0.7;
    }else if(opacity == 0.7){
        monitor.style.opacity = 0;
    }
}