
function line_path_process(){
    line_path_points_to_line();
    line_path_lines_sort_by_epLat();
    line_path_set_next_address();
    line_path_sep_cursor();
    line_path_sep_differ();

    line_path_mark_point();

    //console.log(line_path_lines);

    data_to_file = line_path_data_to_file();
}

function line_path_points_to_line(){
    let temp = new Array();
    for(var i=0; i< line_path_points.length; i++){
        if(i < line_path_points.length-1){
            let cell = {
                "id": i+1,
                "sp": line_path_points[i],
                "ep": line_path_points[i+1]
            };
            temp.push(cell);
        }
    }
    line_path_lines = temp;
}

function line_path_lines_sort_by_epLat() {
    const coords = line_path_lines;
    const n = coords.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (coords[j].ep.lat > coords[j + 1].ep.lat) {
                [coords[j], coords[j + 1]] = [coords[j + 1], coords[j]];
            }
        }
    }

    line_path_lines = coords
}

function line_path_set_next_address(){
    let temp = new Array();
    line_path_lines.forEach(line => {
        var target = line.id+1;
        let next_address = -1;
        for(var i=0;i<line_path_lines.length;i++){
            if(line_path_lines[i].id == target){
                next_address = i+1;
                break;
            }
        }
        let cell = {
            "id": line.id,
            "sp": line.sp,
            "ep": line.ep,
            "next" : next_address
        };

        temp.push(cell);
    });
    line_path_lines = temp;
}

function line_path_sep_cursor(){
    let temp = new Array();
    line_path_lines.forEach(line => {
        const dLon = (line.ep.lng - line.sp.lng) * Math.PI / 180;
        const y = Math.sin(dLon) * Math.cos(line.ep.lat * Math.PI / 180);
        const x = Math.cos(line.sp.lat * Math.PI / 180) * Math.sin(line.ep.lat * Math.PI / 180) - Math.sin(line.sp.lat * Math.PI / 180) * Math.cos(line.ep.lat * Math.PI / 180) * Math.cos(dLon);
        const brng = Math.atan2(y, x) * 180 / Math.PI;
        var cur = parseInt((brng + 360) % 360);

        let cell = {
            "id": line.id,
            "sp": line.sp,
            "ep": line.ep,
            "cursor": cur,
            "next" : line.next
        };
        temp.push(cell);
    });
    line_path_lines = temp;
}


function line_path_sep_differ(){
    let temp = new Array();
    line_path_lines.forEach(line => {
        let cell = {
            "id": line.id,
            "sp": line.sp,
            "ep": line.ep,
            "cursor": line.cursor,
            "next": line.next,
            "diff": {
                "lat_diff": line.sp.lat - line.ep.lat,
                "lon_diff": line.sp.lng - line.ep.lng
            },
        };
        temp.push(cell);
    });
    line_path_lines = temp;
}


function line_path_data_to_file(){
    var data_list = new Array();
    let data_info = new Uint8Array(new ArrayBuffer(16));  //檔案資訊
    data_info[0] = new Date().getMonth()+1  //月
    data_info[1] = new Date().getDate();    //日
    if(line_path_lines.length < 256){ //資料長度
        data_info[2] = 0;
        data_info[3] = line_path_lines.length;
    }else{
        data_info[2] = (line_path_lines.length >> 8) & 0xFF;
        data_info[3] = line_path_lines.length & 0xFF;
    }

    data_list.push(data_info);

    line_path_lines.forEach(line => {
        let arr = new Uint8Array(new ArrayBuffer(16));
        arr[0] = 0xFF;
        arr[1] = ((line.ep.lat * 1000000)>>24) & 0xFF;
        arr[2] = ((line.ep.lat * 1000000)>>16) & 0xFF;
        arr[3] = ((line.ep.lat * 1000000)>>8) & 0xFF;
        arr[4] = (line.ep.lat * 1000000) & 0xFF;
        arr[5] = ((line.ep.lng * 1000000) >>24) & 0xFF;
        arr[6] = ((line.ep.lng * 1000000) >>16) & 0xFF;
        arr[7] = ((line.ep.lng * 1000000) >>8) & 0xFF;
        arr[8] = (line.ep.lng * 1000000) & 0xFF;
        arr[9] = line_path_set_next_address_format(line.next)[0];
        arr[10] = line_path_set_next_address_format(line.next)[1];
        arr[11] = parseInt(line.cursor / 2);
        arr[12] = line_path_set_diff_format(line.diff.lat_diff)[0];
        arr[13] = line_path_set_diff_format(line.diff.lat_diff)[1];
        arr[14] = line_path_set_diff_format(line.diff.lon_diff)[0];
        arr[15] = line_path_set_diff_format(line.diff.lon_diff)[1];
    
        data_list.push(arr);
    });

    arr = new Uint8Array(new ArrayBuffer(16));
    for(var i = 0; i < 16; i++){
            arr[i] = 255;
    }
    data_list.push(arr);

    return data_list;
}

function line_path_set_next_address_format(next_address){
    var data = new Uint8Array(new ArrayBuffer(2));
    
    if(next_address == -1){
        data[0] = 0xFF;
        data[1] = 0xFF;
    }else if(next_address < 256){
        data[0] = 0x00;
        data[1] = next_address & 0xFF;
    }else{
        data[0] = (next_address >> 8) & 0xFF;
        data[1] = next_address & 0xFF;
    }
    return data;
}

function line_path_set_diff_format(diff){
    diff = diff * 1000000;
    if(diff < 0){
        diff = 0xFFFF + diff + 1; // 將差轉換為二補數表示法
    }

    var data = new Uint8Array(new ArrayBuffer(2));
    
    data[0] = (diff >> 8) & 0xFF;
    data[1] = diff & 0xFF;

    return data;
}

function line_path_mark_point(){
    console.log("路線資訊:\n");
    console.log(line_path_lines);
    
    for(var i=0;i<line_path_points.length;i++){
        const line = line_path_points[i];
        let info = "id:"+i+"\nlat:"+(parseInt(line.lat*1000000)/1000000)+"\nlon:"+(parseInt(line.lng*1000000)/1000000);
        L.marker(line)
        .addTo(map)
        .bindPopup(info);
    }
}