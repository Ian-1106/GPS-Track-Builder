function download_file() {
    //藉型別陣列建構的 blob 來建立 URL
    let fileName = "path.bin";
    const data = data_to_file;
    let temp="";
    let blob = new Blob(data, {
        type: "application/octet-stream"
    });
    var href = URL.createObjectURL(blob);
    // 從 Blob 取出資料
    var link = document.createElement("a");
    document.body.appendChild(link);
    link.href = href;
    link.download = fileName;
    link.click();

    add_log("路線資料下載完成","blue");
}

//依照結束點緯度sort
var time = 0;

// 比較函數
function compare(a, b) {
    if (a < b) {
        return 1;
    } else return 0;
    // 不符合排序就return0
}

// 交換函數
function swap(list, a, b) {
    var ele = list[a];
    list[a] = list[b];
    list[b] = ele;

}

// 每一回合執行該函數
function bubbleoneround() {
    var sortornot = 1;
    for (var i = 0; i < points_on_edges_of_graphics_to_output.length - 1; i++) {
        if (compare(points_on_edges_of_graphics_to_output[i][2].lat, points_on_edges_of_graphics_to_output[i + 1][2].lat) == 0) { //ep.lat
            swap(points_on_edges_of_graphics_to_output, i, i + 1)
            sortornot = 0;
            time++
        }
        // 最後一趟會完全是1
    }
    return sortornot;
}

// bubble函數
function bubblesort() {
    for (var i = 0; i < points_on_edges_of_graphics_to_output.length - 1; i++) {
        var sortornot = bubbleoneround(points_on_edges_of_graphics_to_output)
        if (sortornot == 1) {
            console.log(time)
            break;
        }

    }
}

function init_next_point_address(){
    for(var i=0; i<points_on_edges_of_graphics_to_output.length; i++){
        points_on_edges_of_graphics_to_output[i][3] = i+1;  //資料從address:00000010(第二筆)開始
    }
}

function get_nsew_area(lat, lon){	//判讀東西經及南北緯
    var area = -1;
    if(lat > 0 && lon > 0){
        area = 17;	//17(dec) = 11(hex)
    }else if(lat > 0 && lon < 0){
        area = 16;	//16(dec) = 10(hex)
    }else if(lat < 0 && lon > 0){
        area = 1;	//1(dec) = 01(hex)
    }else if(lat < 0 && lon < 0){
        area = 0;	//0(dec) = 00(hex)
    }
    return area;
}

function get_next_point_after_sort(){
    for(var i=0; i<points_on_edges_of_graphics_to_output.length; i++){
        var index = points_on_edges_of_graphics_to_output[i][0];    //index
        var target = index + 1; //目標
        for(var j=0; j <points_on_edges_of_graphics_to_output.length; j++){
            var temp_point = points_on_edges_of_graphics_to_output[j];
            if(target == temp_point[0]) points_on_edges_of_graphics_to_output[i][4] = points_on_edges_of_graphics_to_output[j][3]
        }
    }
}

function get_point_cursor(x, y){
    var radian = Math.atan2(x.lon - y.lon, x.lat - y.lat); // 返回來的是弧度
    var angle = 180 / Math.PI * radian; // 根據弧度計算角度
    return angle;
}

function get_point_differ(value1, value2){
    var diff = value2 - value1;
  
    if(diff < 0){
        diff = 0xFFFF + diff + 1; // 將差轉換為二補數表示法
    }
  
    var data = new Uint8Array(new ArrayBuffer(2));
  
    
    data[0] = (diff >> 8) & 0xFF;
    data[1] = diff & 0xFF;
  
    return data;
  }

