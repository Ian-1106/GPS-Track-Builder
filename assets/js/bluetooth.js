async function init_bt() {
    if (bt_open_flag == false) {
        let reader = null;
        bt_open_flag = true;
        try {
            bt_port = null;
            const baudRate = document.querySelector("#baund_rate_select").options[document.querySelector("#baund_rate_select").selectedIndex].text; //取得BaundRate
            bt_port = await navigator.serial.requestPort();
            
            if (!bt_port && !bt_port.readable) await bt_port.close();
            if (!bt_port.opened) await bt_port.open({ baudRate });
            
            console.log('Selected serial port:' + bt_port.name);
            console.log("baudRate:"+baudRate);

            document.querySelector('#bt_btn').src = "images/disconnect_bt.png";

            reader = bt_port.readable.getReader();
            while (bt_open_flag) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log('Serial port closed');
                    break;
                }
                receive_bt_data(value);
                let data = btData;
                if(data.length >= 64){
                    console.log(data);
                    data = handle_bt_data_to_list(data);
                    if(data != -1) {
                        serial_monitor(data);
                        await draw_cell(data);
                    }
                }
            }
        } catch (error) {
            console.error('Error opening serial port:' + error);
            alert('Error opening serial port:' + error + '\n' + "請檢察Baund Rate是否正確");
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

let receivingDataFlag = false;
let btData = '';
let A5_flag = 0;    //0:有AA有55，1:有AA沒55
function receive_bt_data(value) {
    // 轉換為 16 進制字串並補零
    value = Array.from(new Uint8Array(value)).map((b) => b.toString(16).padStart(2, '0')).join('');
    //console.log(value);
    
    let startIndex = value.indexOf("aa"), endIndex = value.indexOf("55");
    if(A5_flag == 0){
        if(startIndex >= 0 && endIndex >= 0){   //有AA有55
            btData = value.substring(startIndex, endIndex+2);
            //console.log(btData);
        }else if(startIndex >= 0 && endIndex < 0){ //有AA沒55
            A5_flag = 1;
            btData = value.substring(startIndex, 64);
            //console.log(btData);
        }
    }else if(A5_flag == 1){
        if(startIndex < 0 && endIndex >= 0){
            btData += value.substring(0, endIndex+2);
            A5_flag = 0;
        }
    }
}

function handle_bt_data_to_list(value) {
    const start = parseInt(value.substring(0, 2), 16);
    const end = parseInt(value.substring(62, 64), 16);
    const check_sum = parseInt(value.substring(60, 62), 16);

    let proc_check_sum = 0;
    for (let i = 2; i < 56; i += 2) {
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
            "offset": parseInt(value.substring(50, 54), 16) << 16 >> 16,
            "nsew": parseInt(value.substring(54, 56), 16),
        };

        console.log(value);
        return cell;
    }
    return -1;
}

async function draw_cell(cell){
    //console.log(cell);

    let path = new Array();
    path.push(cell.sp);
    path.push(cell.ep);
    console.log(path);
    
    L.polyline(path, { color: 'green' }).addTo(map);
    if(yp_marker != null) yp_marker.remove();
    yp_marker = L.marker(cell.yp, { icon: yp_icon }).addTo(map); //標註使用者座標

    path = null;
}

function serial_monitor(cell){
    let text = document.querySelector(".監看視窗文字");
    text.innerHTML = "SP:("+cell.sp.lat+","+cell.sp.lon+")<br>"
                    +"EP:("+cell.ep.lat+","+cell.ep.lon+")<br>"
                    +"YP:("+cell.yp.lat+","+cell.yp.lon+")<br>"
                    +"Offset:"+cell.offset;
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