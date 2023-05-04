function init(){
   create_map();  //from create_and_init_map.js: Initial map and mark own location
   add_log("地圖建置完成");
}

//將訊息記錄在log視窗
function add_log(msg , font_color){
   var ul = document.querySelector('#log_msg');
   var li = document.createElement('li');
   if(font_color != "") li.style.color = font_color;  //設定文字顏色
   li.innerHTML = msg;
   ul.appendChild(li);
}

//線段路線設定
var line_data_to_download = new Array();
function download_line_bin(){
   line_path_process();
   add_log("路線資料下載完成","blue");
}

//選框路線設定
function shape_data_to_download(){
   shape_path_process();
}