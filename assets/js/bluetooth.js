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
			
				if (device_is_upload_mode == false) { // 工作模式
					proc_packet(value); // 資料擷取
					if (bt_data_receiving_flag == false) {
						console.log("燒錄模式:" + device_is_upload_mode + " , bt_data_flag:" + bt_data_flag);
						switch (bt_data_flag) {
							case 0:							//詢問連線藍牙
								bt_data_flag_0_process();
								break;
							case 1:							//所有路線的頭
								bt_data_flag_1_process();
								break;
							case 2:							//所有路線的資料
								bt_data_flag_2_process();
								break;
							case 3:							//所有路線接收完成
								bt_data_flag_3_process();
								break;
							case 4:							//offset的頭
								bt_data_flag_4_process();
								break;
							case 5:							//offset的資料
								bt_data_flag_5_process();
								serial_monitor();
								break;
							case 6:							//傳送進入燒錄模式請求
								bt_data_flag_6_process();
								break;
							case 7:							//進入燒錄模式
								bt_data_flag_7_process();
								console.log("bt_open_flag:" + bt_open_flag);	
								break;
						}
					}
				} 
				
				if (device_is_upload_mode == true) {
					console.log("燒錄模式:" + device_is_upload_mode + " , bt_data_flag:" + bt_data_flag);
					//console.log(bt_data_unit8array);
					switch (bt_data_flag) {
						case 8:							//傳送燒錄數據的資訊
							bt_data_flag_8_process();	
							break;
						case 9:							//傳送燒錄數據的資訊是否成功
							bt_data_flag_9_process();
							break;
						case 10:						//傳送燒錄數據的資訊
							bt_data_flag_10_process();	
							break;
						case 11:						//傳送要燒錄的數據是否成功
							bt_data_flag_11_process();	
							break;
						case 12:						//傳送寫入完成的指令
							bt_data_flag_12_process();	
							break;
						case 13:						//傳送寫入完成的指令是否成功
							bt_data_flag_13_process();
							break;
						case 14:						//傳送退出燒錄模式的指令
							bt_data_flag_14_process();	
							break;
						case 15:						//傳送退出燒錄模式的指令是否成功
							bt_data_flag_15_process();
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
					bt_data_flag = 0;
					sp_marker = null;
					yp_marker = null;
					ep_marker = null;
					dist_offset =  null;
					cur_offset = null;
					yp_marker_on_map = null;					
					bt_port = null;
					bt_open_flag = false;
					bt_data_flag = 0;//初始狀態
					bt_data_receiving_flag = false;
					bt_data_unit8array = null;
					all_path_count = -1;    //所有路線總筆數
					per_sep_btye_count = -1;    //依次寫入的byte數
					all_path_datalist = new Array();
					offset_data_size = -1;
					JJ_log_file = "";
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

function proc_packet(value){
	if(bt_data_receiving_flag == false){	//沒有在接收資料
		bt_data_unit8array = value;
		bt_data_receiving_flag = true;
	}else{	//正在接收資料
		let temp = bt_data_unit8array;
		bt_data_unit8array = new Uint8Array(new ArrayBuffer(temp.length + value.length));
		bt_data_unit8array.set(temp, 0);
		bt_data_unit8array.set(value, temp.length);
	}

	const start_hight_flag = 8, start_low_flag = 0, end_hight_flag = 89, end_low_flag = 16;
	let start_byte = -1, end_byte = -1;
	for(var i=0; i< bt_data_unit8array.length; i++){
		if(bt_data_unit8array[i] == start_hight_flag && bt_data_unit8array.length >= 2 && bt_data_unit8array[i + 1] == start_low_flag){//找封包頭
			start_byte = i;
		}else if(bt_data_unit8array[i] == end_low_flag && bt_data_unit8array.length - 1 >= 0 && bt_data_unit8array[i - 1] == end_hight_flag){//找封包尾
			end_byte = i;
		}
	}
	if(start_byte != -1 && end_byte != -1 && start_byte < end_byte){
		bt_data_receiving_flag = false;	//停止接收資料
		let temp = new Uint8Array(new ArrayBuffer(end_byte - start_byte +1));
		let temp_count = 0;
		for(var i = start_byte; i < end_byte + 1; i++) temp[temp_count++] = bt_data_unit8array[i]; //擷取資料
		bt_data_unit8array = temp;
	}
}

function send_packet(packet) {
    const writer = bt_port.writable.getWriter(); // 取得寫入器
    writer.write(packet); // 寫入封包
    writer.releaseLock(); // 釋放寫入器鎖定
}

function proc_function_code(f1, f2){
	return bt_data_unit8array[2] == f1 && bt_data_unit8array[3] == f2 ? true : false;
}

function proc_checksum() {
	let checksum = 0;
	for(var i = 2; i < bt_data_unit8array.length - 3; i++) {
		checksum ^= bt_data_unit8array[i];
	}
	
  return bt_data_unit8array[bt_data_unit8array.length - 3] === checksum;
}

//詢問連線藍牙
function bt_data_flag_0_process(){	
	if(proc_function_code(49, 1)){
		let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 1;
        send_packet(packet);
		
		bt_data_flag = 1;
	}else{
		let packet = new Uint8Array(new ArrayBuffer(2));
		packet[0] = 3;
		packet[1] = 2;
		send_packet(packet);
	}
}

//傳送所有路線的頭
function bt_data_flag_1_process(){	
	if(proc_function_code(49, 4)){
		if(proc_checksum()){
			all_path_count = bt_data_unit8array[4] * 256 + bt_data_unit8array[5];
			per_sep_btye_count = bt_data_unit8array[6] * 256 + bt_data_unit8array[7];
			
			let packet = new Uint8Array(new ArrayBuffer(2));
			packet[0] = 3;
			packet[1] = 1;
			send_packet(packet);
			
			add_log("預計接收完成" + all_path_datalist.length + "筆路線");
			bt_data_flag = 2;
		}else{
			let packet = new Uint8Array(new ArrayBuffer(2));
			packet[0] = 3;
			packet[1] = 2;
			send_packet(packet);
		}
	}else{
		let packet = new Uint8Array(new ArrayBuffer(2));
		packet[0] = 3;
		packet[1] = 2;
		send_packet(packet);
	}
}

//傳送所有路線的資料
function bt_data_flag_2_process(){	
	if(proc_function_code(49, 5)){
		if(proc_checksum()){
			for(var i = 0; i < (per_sep_btye_count / 16); i++){
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
            send_packet(packet);

            add_log("已接收" + all_path_datalist.length + "筆路線");

            bt_data_unit8array = null;
            if(all_path_datalist.length >= all_path_count){
                bt_data_flag = 3;
            }
		}else{
			let packet = new Uint8Array(new ArrayBuffer(2));
			packet[0] = 3;
			packet[1] = 2;
			send_packet(packet);
		}
	}else{
		let packet = new Uint8Array(new ArrayBuffer(2));
		packet[0] = 3;
		packet[1] = 2;
		send_packet(packet);
	}
}

//傳送完所有路線資料
function bt_data_flag_3_process(){	
	if(proc_function_code(49, 6)){
		let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 1;
        send_packet(packet);
		
		add_log("接收完成，總共" + all_path_datalist.length + "筆路線");
		draw_all_path();
		
		bt_data_flag = 4;
	}else{
		let packet = new Uint8Array(new ArrayBuffer(2));
		packet[0] = 3;
		packet[1] = 2;
		send_packet(packet);
	}
}

//傳送offset的頭
function bt_data_flag_4_process(){	
	if(proc_function_code(49, 7)){
		offset_data_size = bt_data_unit8array[4];
		
		let packet = new Uint8Array(new ArrayBuffer(2));
        packet[0] = 3;
        packet[1] = 1;
        send_packet(packet);
		
		add_log("正在即時更新位置");
		bt_data_flag = 5;
	}else{
		let packet = new Uint8Array(new ArrayBuffer(2));
		packet[0] = 3;
		packet[1] = 2;
		send_packet(packet);
	}
}

//傳送offset的資料
function bt_data_flag_5_process(){	
	if(proc_function_code(49, 8)){
		if(proc_checksum()){
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
			
			system_status = bt_data_unit8array[29];
			speed = (bt_data_unit8array[30] << 8 | bt_data_unit8array[31]);
			dist_offset = ((bt_data_unit8array[32] << 8) | bt_data_unit8array[33]) >= 0x8000 ? ((bt_data_unit8array[32] << 8) | bt_data_unit8array[33]) - 0x10000 : ((bt_data_unit8array[32] << 8) | bt_data_unit8array[33]);
			sep_dist = (bt_data_unit8array[34] << 8 | bt_data_unit8array[35]);
			sep_cursor = (bt_data_unit8array[36] << 8 | bt_data_unit8array[37]);
			ysp_dist = (bt_data_unit8array[38] << 8 | bt_data_unit8array[39]);
			ysp_cursor = (bt_data_unit8array[40] << 8 | bt_data_unit8array[41]);
			yep_dist = (bt_data_unit8array[42] << 8 | bt_data_unit8array[43]);
			yep_cursor = (bt_data_unit8array[44] << 8 | bt_data_unit8array[45]);

			draw_offset_data();
		}
	}
}

//傳送進入燒錄模式請求
function bt_data_flag_6_process(){	
	let packet = new Uint8Array(new ArrayBuffer(6));
	packet[0] = 8;
	packet[1] = 0;
	packet[2] = 49;
	packet[3] = 2;
	packet[4] = 89;
	packet[5] = 16;
	send_packet(packet);

	bt_data_flag = 7;
	add_log("準備進入燒錄模式");
}

//進入燒錄模式
function bt_data_flag_7_process(){
	if(proc_function_code(1, 1)){
		add_log("進入燒錄模式");
		device_is_upload_mode = true;
		bt_data_flag = 8;
	}else bt_data_flag = 6;
}

//傳送要燒錄的數據的資訊
function bt_data_flag_8_process(){
	data_to_file_temp = new Array();	
	for(var i = 0; i < sizeof_data_to_file / per_write_size_from_data_to_file; i++){
		data_to_file_temp.push(data_to_file.slice(i * 256, (i + 1) * 256));
	} 
	data_to_file = data_to_file_temp;	//數據打包準備發送，每個區間都是256個byte

	let packet = new Uint8Array(new ArrayBuffer(13));
	packet[0] = 8;
	packet[1] = 0;
	packet[2] = 6;
	packet[3] = 5;
	packet[4] = (sizeof_data_to_file >> 24) & 0xFF;
	packet[5] = (sizeof_data_to_file >> 16) & 0xFF;
	packet[6] = (sizeof_data_to_file >> 8) & 0xFF;
	packet[7] = sizeof_data_to_file & 0xFF;
	packet[8] = per_write_size_from_data_to_file >> 8;
	packet[9] = per_write_size_from_data_to_file;
	packet[10] = 255;
	packet[11] = 89;
	packet[12] = 16;

	let checksum = 0;
	for(var i=2; i<10; i++) checksum ^= packet[i];
	checksum ^= 0xff;
	packet[10] = checksum;

	send_packet(packet);

	bt_data_flag = 9;
}

//傳送燒錄數據的資訊是否成功
function bt_data_flag_9_process(){
	if(proc_function_code(1, 1)){
		add_log("傳送路線燒錄資訊完成，資料總共"+sizeof_data_to_file+"個byte，一次寫入"+per_write_size_from_data_to_file+"個byte");
		bt_data_flag = 10;
	}else bt_data_flag = 8;
}

//傳送要燒錄的數據
function bt_data_flag_10_process(){
	let packet = data_to_file[write_data_count_times]; // 擷取部分資料形成新的陣列 
	console.log("times:"+(sizeof_data_to_file / per_write_size_from_data_to_file)+", write_data_count_times:"+write_data_count_times);
	console.log(packet);

	let temp = packet;
	let start_and_function_code = new Uint8Array(new ArrayBuffer(4));
	start_and_function_code[0] = 8;
	start_and_function_code[1] = 0;
	start_and_function_code[2] = 8;
	start_and_function_code[3] = 3;
	let percent_and_checksum_and_end = new Uint8Array(new ArrayBuffer(4));
	percent_and_checksum_and_end[0] = 255;	//百分比先填0xff
	percent_and_checksum_and_end[1] = 255;	//checksum先填0xff
	percent_and_checksum_and_end[2] = 89;	//百分比先填0xff
	percent_and_checksum_and_end[3] = 16;	//checksum先填0xff

	packet = new Uint8Array(new ArrayBuffer(temp.length + start_and_function_code.length + percent_and_checksum_and_end.length));
	packet.set(start_and_function_code, 0);
	packet.set(temp, start_and_function_code.length);
	packet.set(percent_and_checksum_and_end, start_and_function_code.length+temp.length);

	let checksum = 0;
	for(var i = 2; i < packet.length - 3; i++){
		checksum ^= packet[i];
	}
	checksum ^= 0xff;
	packet[packet.length - 3] = checksum;

	send_packet(packet);

	bt_data_flag = 11;

}

//傳送要燒錄的數據是否成功
function bt_data_flag_11_process(){
	if(proc_function_code(1, 1)){
		if(write_data_count_times < data_to_file.length - 1){
			write_data_count_times++;
			bt_data_flag = 10;
		}		
	}else bt_data_flag = 12;
}

//傳送寫入完成的指令
function bt_data_flag_12_process(){
	let packet = new Uint8Array(new ArrayBuffer(13));
	packet[0] = 8;
	packet[1] = 0;
	packet[2] = 8;
	packet[3] = 4;
	packet[4] = 89;
	packet[5] = 16;
	send_packet(packet);

	bt_data_flag = 13;
}

//傳送寫入完成的指令是否成功
function bt_data_flag_13_process(){
	if(proc_function_code(1, 1)){
		bt_data_flag = 14;
	}else bt_data_flag = 13;
}

//傳送退出燒錄模式的指令
function bt_data_flag_14_process(){
	let packet = new Uint8Array(new ArrayBuffer(13));
	packet[0] = 8;
	packet[1] = 0;
	packet[2] = 49;
	packet[3] = 3;
	packet[4] = 89;
	packet[5] = 16;
	send_packet(packet);

	bt_data_flag = 15;
}

//傳送退出燒錄模式的指令是否成功
function bt_data_flag_15_process(){
	if(proc_function_code(1, 1)){
		bt_data_flag = 0;
		device_is_upload_mode = false;
	}else bt_data_flag = 14;
}

function serial_monitor(){
    if(sp_marker != null && ep_marker != null && yp_marker != null && dist_offset != null){
        let text = document.querySelector(".監看視窗文字");
        text.innerHTML = "SP:("+sp_marker.lat+","+sp_marker.lon+")<br>"
                        +"EP:("+ep_marker.lat+","+ep_marker.lon+")<br>"
                        +"YP:("+yp_marker.lat+","+yp_marker.lon+")<br>"
						+"System Status:"+system_status+"<br>"
						+"Speed:"+speed+"<br>"
						+"Dist Offset:"+dist_offset+"<br>"
                        +"SEP Dist  " + sep_dist+"<br>"
						+ "SEP Cursor" + sep_cursor+"<br>"
						+ "YSP Dist  " + ysp_dist+"<br>"
						+ "YSP Cursor" + ysp_cursor+"<br>"
						+ "YEP Dist  " + yep_dist+"<br>"
						+ "YEP Cursor" + yep_cursor+"<br>";
						
        JJ_log_file += "SP:("+sp_marker.lat+","+sp_marker.lon+"),"
                        +"EP:("+ep_marker.lat+","+ep_marker.lon+"),"
                        +"YP:("+yp_marker.lat+","+yp_marker.lon+"),"
						+"System Status:"+system_status+","
						+"Speed:"+speed+","
                        +"Dist Offset:"+dist_offset+","
                        +"SEP Dist  " + sep_dist+","
						+ "SEP Cursor" + sep_cursor+","
						+ "YSP Dist  " + ysp_dist+","
						+ "YSP Cursor" + ysp_cursor+","
						+ "YEP Dist  " + yep_dist+","
						+ "YEP Cursor" + yep_cursor+"\n";
    }
}

function draw_all_path() {
    all_path_datalist.forEach((element, index) => {
        let path = [element.sp, element.ep];

        let polyline = L.polyline(path, { color: 'blue' }).addTo(map).bindPopup("路線編號:" + (index + 1));
        let arrowHead = L.polylineDecorator(polyline, {
            patterns: [
                { offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: false, pathOptions: { stroke: true, color: 'blue' } }) }
            ]
        }).addTo(map);
    });
}

function draw_offset_data(){
	draw_all_path();
    let path = [sp_marker, ep_marker];
    let polyline = L.polyline(path, { color: 'green' }).addTo(map);
    let arrowHead = L.polylineDecorator(polyline, {
        patterns: [
            { offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: false, pathOptions: { stroke: true, color: 'green' } }) }
        ]
    }).addTo(map);

    if(yp_marker_on_map != null) map.removeLayer(yp_marker_on_map);
    yp_marker_on_map = L.marker(yp_marker, { icon: yp_icon }).addTo(map); //標註使用者座標
}