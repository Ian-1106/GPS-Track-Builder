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

   var log = document.querySelector('.log');
   log.scrollTop = log.scrollHeight;
}

//線段路線設定
var line_data_to_download = new Array();
function download_line_bin(){
   line_path_process();
   console.log(data_to_file);
   add_log("路線資料下載完成","#37caad");
}

//選框路線設定
function shape_data_to_download(){
   shape_path_process();
}

function upload_to_device(){
   if(bt_data_receiving_flag == false && bt_data_flag != 6){
      bt_data_receiving_flag = true;
	   bt_data_flag = 6;

      let data_to_file_temp = new Array();	
      for(var i = 0; i < data_to_file.length; i++){
         for(var j = 0; j < 16; j++){
            data_to_file_temp.push(data_to_file[i][j]);//二維轉一維
         }
      }
      data_to_file = data_to_file_temp;

      sizeof_data_to_file = data_to_file.length;
      per_write_size_from_data_to_file = 256;

      let add_ff_count_array = new Uint8Array(new ArrayBuffer(256 - data_to_file.length % 256));
      for(var i = 0; i < add_ff_count_array.length; i++) add_ff_count_array[i] = 0xff;

      let data_to_file_temp_temp = data_to_file_temp;
      data_to_file = new Uint8Array(new ArrayBuffer(data_to_file_temp_temp.length + add_ff_count_array.length));
      data_to_file.set(data_to_file_temp_temp, 0);
      data_to_file.set(add_ff_count_array, data_to_file_temp_temp.length);
   }
}

function open_popup(){
   let monitor = document.querySelector(".監看視窗");
   let opacity = window.getComputedStyle(monitor).opacity;
   if(opacity == 0){
      monitor.style.opacity = 0.7;
   }else if(opacity == 0.7){
      monitor.style.opacity = 0;
   }
}

function jj_download_log_file(){
   const element = document.createElement('a');
   const file = new Blob([JJ_log_file], { type: 'text/plain' });
   element.href = URL.createObjectURL(file);
   element.download = "JJ Log.txt";
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
}

