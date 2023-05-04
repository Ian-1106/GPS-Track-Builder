async function init_bt(){
    try {
        const baudRate = 115200;
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate });
        console.log('Selected serial port:'+port.name);
        // 在這裡進行串口的讀寫等操作
    } catch (error) {
        console.error('Error opening serial port:'+ error);
    }
}