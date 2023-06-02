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
                        let packet = new Uint8Array(new ArrayBuffer(2));
                        packet[0] = 0x23;
                        packet[1] = 0x26;
                        await sendPacket(packet);
                        
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

function bt_flag_0_receive_data(value){

}