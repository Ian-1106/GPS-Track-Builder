async function init_bt() {
    if (bt_open_flag == false) {
        bt_open_flag = true;
        try {
            bt_port = null;
            const baudRate = 115200;
            bt_port = await navigator.serial.requestPort();
            await bt_port.open({ baudRate });
            console.log('Selected serial port:' + bt_port.name);

            document.querySelector('#bt_btn').src = "images/disconnect_bt.png";

            const reader = bt_port.readable.getReader();
            while (bt_open_flag) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log('Serial port closed');
                    break;
                }
                //console.log(value);
                let data = receive_bt_data(value);
                data = handle_bt_data_to_list(data);
                if(data != -1) await draw_cell(data);
            }
            
            reader.cancel();// 解除讀取器的鎖定
        } catch (error) {
            console.error('Error opening serial port:' + error);
        } finally {
        await bt_port.close();
        }
    } else if (bt_open_flag == true) {
        bt_open_flag = false;
    }
}

function receive_bt_data(value){
    let bt_data = '';
    let receiving_data_flag = false;
    value = Array.from(new Uint8Array(value)).map(b => b.toString(16).padStart(2, '0')).join('');   // 將接收到的值轉換成 16 進制字串並補零
    const start = "aa", end = "55", data_length = 64;
    if(receiving_data_flag == false){
        receiving_data_flag = true;
        const startIndex = value.indexOf(start);
        const endIndex = value.indexOf(end, startIndex + 1);
        if(startIndex >= 0 && endIndex > startIndex){
            bt_data = value.substring(startIndex + 2, endIndex);
        }
        bt_data = "aa"+bt_data+"55";
        if(bt_data.length != data_length) bt_data = '';
        receiving_data_flag = false;
    }
    return bt_data;
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
    console.log(cell);

    let path = new Array();
    path.push(cell.sp);
    path.push(cell.ep);
    console.log(path);
    
    L.polyline(path, { color: 'green' }).addTo(map);
    if(yp_marker != null) yp_marker.remove();
    yp_marker = L.marker(cell.yp, { icon: yp_icon }).addTo(map); //標註使用者座標

    path = null;
}



function open_popup(){
    //handle_bt_data_to_list("240167691c072e335001676B8A072E335701676B85072E31941B0611FFFF9B23");

}