async function init_bt() {  //點擊BT按鈕後打開port等用戶電腦連接上裝置後開始接收資料
    if(bt_open_flag == false){
        bt_open_flag = true;
        try {
            const baudRate = 115200;
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate });
            console.log('Selected serial port:' + port.name);

            // 建立串流讀取器
            const reader = port.readable.getReader();

            // 讀取藍牙資料
            while (bt_open_flag) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log('Serial port closed');
                    break;
                }
                //console.log('Received data:', value);
                handle_bt_data_to_list(value);  //將接收到的資料進行處理
            }

        } catch (error) {
            console.error('Error opening serial port:' + error);
        }
    }else if(bt_open_flag == true){
        bt_open_flag = false;
    }
}

let accumulatedValue = '';
function handle_bt_data_to_list(value) {
    // 將接收到的值轉換成 16 進制字串並補零
    value = Array.from(new Uint8Array(value)).map(b => b.toString(16).padStart(2, '0')).join('');
    accumulatedValue += value;

    // 如果累積的資料長度不足 64，則繼續等待資料
    if (accumulatedValue.length < 64) {
        return;
    }

    // 資料長度足夠時開始進行處理
    const start = parseInt(accumulatedValue.substring(0, 2), 16);
    const end = parseInt(accumulatedValue.substring(62, 64), 16);
    const check_sum = parseInt(accumulatedValue.substring(60, 62), 16);

    let proc_check_sum = 0;
    for (let i = 2; i < 56; i += 2) {
        let byte = parseInt(accumulatedValue.substring(i, i + 2), 16);
        proc_check_sum ^= byte;
    }

    if (start === 170 && end === 85 && proc_check_sum === check_sum) {
        const cell = {
            "yp": {
                "lat": parseInt(accumulatedValue.substring(2, 10), 16) / 1000000,
                "lon": parseInt(accumulatedValue.substring(10, 18), 16) / 1000000
            },
            "sp": {
                "lat": parseInt(accumulatedValue.substring(18, 26), 16) / 1000000,
                "lon": parseInt(accumulatedValue.substring(26, 34), 16) / 1000000
            },
            "ep": {
                "lat": parseInt(accumulatedValue.substring(34, 42), 16) / 1000000,
                "lon": parseInt(accumulatedValue.substring(42, 50), 16) / 1000000
            },
            "offset": parseInt(accumulatedValue.substring(50, 54), 16) << 16 >> 16,
            "nsew": parseInt(accumulatedValue.substring(54, 56), 16),
        };
        console.log(cell);

        const path = new Array();
        path.push(cell.sp);
        path.push(cell.ep);
        console.log(path);
        
        L.polyline(path, { color: 'green' }).addTo(map);
        if(yp_marker != null) yp_marker.remove();
        yp_marker = L.marker(cell.yp, { icon: yp_icon }).addTo(map); //標註使用者座標

        // 處理完資料後清空累積值
        accumulatedValue = '';
    }
}



function open_popup(){
    //handle_bt_data_to_list("240167691c072e335001676B8A072E335701676B85072E31941B0611FFFF9B23");

}