/*
各項參數
*/
let user_location = null;   //使用者的座標
let map;    //地圖物件
let user_location_icon = new L.Icon({   //使用者座標icon
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25 , 41],
    iconAnchor: [12 , 41],
    popupAnchor: [1 , 34],
    shadowSize: [41 , 41],
    opacity: 1.0
});

let sp_icon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

let yp_icon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

let ep_icon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

let sp_marker = null;
let yp_marker = null;
let ep_marker = null;

let drawItem;   //圖層

let path_type = null;
let line_path_points = new Array(); //線段路線設定的座標
let line_path_lines = new Array(); //線段路線設定的路線

let shape_path_points = new Array(); //選框路線設定的座標
let shape_path_lines = new Array(); //選框路線設定的路線

let data_to_file = new Array(); //最終要下載的資料

let bt_port = null;
let bt_open_flag = false;
let bt_data_flag = 0;//初始狀態
//let bt_data_list = new Array(); //從藍牙接收到並整理過的資料

let JJ_log_file = "";