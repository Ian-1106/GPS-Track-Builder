function init_bt(){
    // 请求访问蓝牙设备
    navigator.bluetooth.requestDevice({ 
        filters: [{ services: ['serial_port'] }] 
    })
    .then(device => {
        // 连接到蓝牙设备
        return device.gatt.connect(); 
    })
    .then(server => {
        // 获取服务
        return server.getPrimaryService('serial_port'); 
    })
    .then(service => {
        // 获取特征
        return service.getCharacteristic('rx'); 
    })
    .then(characteristic => {
        // 监听数据变化
        characteristic.addEventListener('characteristicvaluechanged', event => {
        const value = new TextDecoder().decode(event.target.value);
        // 显示接收到的数据
        console.log(value);
        });
        // 启动通知
        return characteristic.startNotifications(); 
    })
    .catch(error => {
        console.error(error);
    });
}