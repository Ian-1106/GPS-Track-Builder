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

                if(bt_data_receiving_flag == false){
                    bt_data_unit8array = value;
                    bt_data_receiving_flag = true;
                }else{
                    let temp = bt_data_unit8array;
                    bt_data_unit8array = new Uint8Array(new ArrayBuffer(temp.length + value.length));
                    bt_data_unit8array.set(temp, 0);
                    bt_data_unit8array.set(value, temp.length);
                }

                proc_get_packet();

                console.log("bt_data_flag:"+bt_data_flag);
                //console.log(bt_data_unit8array);
                
                if(bt_data_receiving_flag == false){
                    switch(bt_data_flag){
                        case 0:                         //初始狀態，詢問是否有BT連線
                            bt_flag_0_receive_data();
                            break;
                        case 1:
                            bt_flag_1_receive_data();
                            break;
                        case 2:
                            bt_flag_2_receive_data();
                            break;
                        case 3:
                            bt_flag_3_receive_data();
                            break;
                        case 4:
                            bt_flag_4_receive_data();
                            break; 
                        case 5:
                            bt_flag_5_receive_data();
                            serial_monitor();
                            break; 
                    }
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

function proc_get_packet(){
    let start = 0, end = 0;
    for (let i = 0; i < bt_data_unit8array.length; i++){
        if (bt_data_unit8array[i] == 8 && bt_data_unit8array[i+1] == 0){
            start = i;
        }
        else if(bt_data_unit8array[i] == 89 && bt_data_unit8array[i+1] === 16){
            end = i + 1
        }
    }

    if(start > 0 && end > 0){
        if(start < end){
            let temp = new Uint8Array(new ArrayBuffer((end - start) + 1));
            let temp_index = 0;
            for(var i = start; i <= end; i++){
                temp[temp_index++] = bt_data_unit8array[i];
            }
            bt_data_unit8array = temp;
            bt_data_receiving_flag = false;
        }
    }
}

async function sendPacket(packet) {
    const writer = bt_port.writable.getWriter(); // 取得寫入器
    await writer.write(packet); // 寫入封包
    await writer.releaseLock(); // 釋放寫入器鎖定
}

function proc_packet(list, function_code_hight, function_code_low){
    if(list != null){
        if(list.length >= 6){
            if(list[0] == 8 && list[1] == 0 && list[list.length - 2] == 89  && list[list.length -1] == 16){
                if(list[2] == function_code_hight && list[3] == function_code_low){
                    return true;
                }else return false;
            }else return false;
        }else return false;
    }else return false;
}

function proc_checksum(list){
    let result = 0;
    for(var i=0;i<list.length;i++) {
        result ^= list[i];
    }
    return result;
}

async function bt_flag_0_receive_data(){    //BT連線詢問
    if(proc_packet(bt_data_unit8array, 49, 1)){
        bt_data_flag = 1;

        let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 1;
        await sendPacket(packet);

        bt_data_unit8array = null;
    }else{
        let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 2;
        await sendPacket(packet);
    }
}

async function bt_flag_1_receive_data(){    //接收所有路線的資訊
    if(proc_packet(bt_data_unit8array, 49, 3)){
        let checksum = 0;
        for(var i = 2; i < bt_data_unit8array.length - 3; i++) {
            checksum ^= bt_data_unit8array[i];
        }
        if(checksum == bt_data_unit8array[bt_data_unit8array.length - 3]){
            bt_data_flag = 2;

            all_path_count = bt_data_unit8array[4] * 255 + bt_data_unit8array[5];
            per_sep_btye_count = bt_data_unit8array[6] * 255 + bt_data_unit8array[7];

            add_log("所有路線共" + all_path_count + "筆，一次寫入" + per_sep_btye_count + "byte");

            let packet = new Uint8Array(new ArrayBuffer(2));
            packet[0] = 3;
            packet[1] = 1;
            await sendPacket(packet);

            bt_data_unit8array = null;
        }else{
            let packet = new Uint8Array(new ArrayBuffer(2));
            packet[0] = 3;
            packet[1] = 2;
            await sendPacket(packet);
        }
    }
}

async function bt_flag_2_receive_data(){    //接收所有路線
    if(proc_packet(bt_data_unit8array, 49, 4)){
        let checksum = 0;
        for(var i = 2; i < bt_data_unit8array.length - 3; i++) {
            checksum ^= bt_data_unit8array[i];
        }
        
        if(checksum == bt_data_unit8array[bt_data_unit8array.length - 3]){
            for(var i = 0; i < ((per_sep_btye_count / 16)); i++){
                let temp = new Uint8Array(new ArrayBuffer(16));
                let temp_index = 0;
                for(var j = 4; j < 20; j++) {
                    temp[temp_index++] = bt_data_unit8array[i * 16 + j];
                }

                let value = new Array();
                for(var k = 0; k < 13; k+=4) {
                    let proc_value = new Uint8Array([temp[k], temp[k+1], temp[k+2], temp[k+3]]);
                    value.push((proc_value[0] << 24 | proc_value[1] << 16 | proc_value[2] << 8 | proc_value[3]) / 1000000);
                }
                
                all_path_datalist.push({
                    sp: {
                        lat: value[0],
                        lon: value[1]
                    },
                    ep: {
                        lat: value[2],
                        lon: value[3]
                    }
                });
            }

            let packet = new Uint8Array(new ArrayBuffer(2));
            packet[0] = 3;
            packet[1] = 1;
            await sendPacket(packet);

            bt_data_unit8array = null;
            if(all_path_datalist.length >= all_path_count){
                bt_data_flag = 3;
                console.log(all_path_datalist);
            }
        }else{
            add_log("Error: 理論:" + bt_data_unit8array[bt_data_unit8array.length - 3] + "實際:" + checksum);

            let packet = new Uint8Array(new ArrayBuffer(2));
            packet[0] = 3;
            packet[1] = 2;
            await sendPacket(packet);
        }
    }
}

async function bt_flag_3_receive_data(){    //接收所有路線傳送完成的指令
    if(proc_packet(bt_data_unit8array, 49, 5)){
        let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 1;
        await sendPacket(packet);

        add_log("所有路線接收完畢，已接收" + all_path_datalist.length + "筆路線");
        draw_all_path();

        bt_data_unit8array = null;
        bt_data_flag = 4;
    }else{
        let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 2;
        await sendPacket(packet);
    }
}

async function bt_flag_4_receive_data(){    //接收offset封包的資訊
    if(proc_packet(bt_data_unit8array, 49, 6)){
        offset_data_size = bt_data_unit8array[4];

        let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 1;
        await sendPacket(packet);

        add_log("準備接收Offset資訊,資料大小" + offset_data_size + " bytes");

        bt_data_unit8array = null;
        bt_data_flag = 5;
    }else{
        let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 2;
        await sendPacket(packet);
    }
}

async function bt_flag_5_receive_data(){    //接收offset封包的資訊
    if(proc_packet(bt_data_unit8array, 49, 7)){
        let checksum = 0;
        for(i = 2; i < bt_data_unit8array.length - 3; i++){
            checksum ^= bt_data_unit8array[i];
        }
        if(checksum == bt_data_unit8array[bt_data_unit8array.length - 3]){
            let temp = new Array();
            for(var j = 4; j < 25; j+=4){
                temp.push((bt_data_unit8array[j] << 24 | bt_data_unit8array[j+1] << 16 | bt_data_unit8array[j+2] << 8 | bt_data_unit8array[j+3]) / 1000000);
            }

            yp_marker = {
                "lat": temp[0],
                "lon": temp[1]
            };
            sp_marker = {
                "lat": temp[2],
                "lon": temp[3]
            };
            ep_marker = {
                "lat": temp[4],
                "lon": temp[5]
            };
            dist_offset = (bt_data_unit8array[28] << 8) | bt_data_unit8array[29];
            dist_offset = dist_offset >= 0x8000 ? dist_offset - 0x10000 : dist_offset;

            cur_offset = (bt_data_unit8array[31] << 8) | bt_data_unit8array[32];
            cur_offset = cur_offset >= 0x8000 ? cur_offset - 0x10000 : cur_offset;

            draw_offset_data();
        }

        bt_data_unit8array = null;
    }
}

function serial_monitor(){
    if(sp_marker != null && ep_marker != null && yp_marker != null && dist_offset != null && cur_offset != null){
        let text = document.querySelector(".監看視窗文字");
        text.innerHTML = "SP:("+sp_marker.lat+","+sp_marker.lon+")<br>"
                        +"EP:("+ep_marker.lat+","+ep_marker.lon+")<br>"
                        +"YP:("+yp_marker.lat+","+yp_marker.lon+")<br>"
                        +"Dist Offset:"+dist_offset+"<br>"
                        +"Cursor Offset:"+cur_offset;
    }
}

function draw_all_path() {
    all_path_datalist.forEach(element => {
        let path = [element.sp, element.ep];
        
        let polyline = L.polyline(path, { color: 'blue' }).addTo(map);

        let arrowHead = L.polylineDecorator(polyline, {
            patterns: [
                { offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: false, pathOptions: { stroke: true, color: 'blue' } }) }
            ]
        }).addTo(map);
    });
}

function draw_offset_data(){
    let path = [sp_marker, ep_marker];
    let polyline = L.polyline(path, { color: 'green' }).addTo(map);
    let arrowHead = L.polylineDecorator(polyline, {
        patterns: [
            { offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: false, pathOptions: { stroke: true, color: 'green' } }) }
        ]
    }).addTo(map);
    L.marker(yp_marker, { icon: yp_icon }).addTo(map); //標註使用者座標
}