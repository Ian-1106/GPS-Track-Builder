function shape_path_process(){
    let distance = document.querySelector('#interval_of_distance_set_by_user').value;   //使用者輸入的間隔距離
    let dir = document.querySelector('#direction').value;  //取得路經規劃方向
    if(distance != ""){ //檢查使用者是否有輸入間隔距離
        switch(document.querySelector('#unit_of_distance').value){  //select選單選擇的單位
            case 'm':   //公尺
                break;
            case 'km':  //公里
                distance = distance * 1000; //公尺轉公里
                break;
        }

        if(IsPtInPoly()) add_log("使用者座標在框選範圍內" , "#b1c9e2");   //判斷使用者是否被框選
        else add_log("使用者座標不在框選範圍內" , "#b1c9e2");

        add_log("間隔距離設定為" + distance);
        add_log("路徑規劃方向: " + dir);

		let scan_dir = getScanDirection(dir);   //取得掃描線方向(垂直或水平)
        let scan_list = new Array();
        let scan_result = new Array();
        if(scan_dir == "vertical"){
            scan_list = get_vertical_scanner_line(distance);   //取得垂直掃描線清單
            scan_result = vertical_scan(scan_list);    //垂直掃描結果
        }else if(scan_dir == "horizontal"){
            scan_list = get_horizontal_scanner_line(distance);   //取得水平掃描線清單
            scan_result = horizontal_scan(scan_list);  //水平掃描結果
        }
        sort_list(scan_result, dir);
        add_log("掃描線建立成功");
        add_log("掃描結果:建立" + scan_result.length + "個座標點","#b1c9e2");

		var data_to_mcu = new Array();
        var count = 1;
        for(var i=0; i<scan_result.length; i++){
            var tmp = scan_result[i];
            L.marker(tmp , {
                title: "id:"+i+" , ("+parseInt(tmp.lat*1000000)/1000000+","+parseInt(tmp.lng*1000000)/1000000+")",
            }).addTo(map);
            if(i % 2 == 0){
                var tmp = new Array();      //tmp: [id, sp, ep, address]
                let sp ={
                    'lat': scan_result[i].lat,
                    'lon': scan_result[i].lng
                };
                let ep ={
                    'lat': scan_result[i+1].lat,
                    'lon': scan_result[i+1].lng
                };

                var draw_tmp = new Array(); //去程
                draw_tmp.push(sp);
                draw_tmp.push(ep);
                draw_path(draw_tmp);

                tmp.push(count++);      //id
                tmp.push(sp);           //sp
                tmp.push(ep);           //ep   
                tmp.push(-1);           //address
                tmp.push(-1);           //next address 
                data_to_mcu.push(tmp);

                tmp = new Array();          //回程
                var temp_point = sp;
                sp = ep;
                ep = temp_point;

                tmp.push(count++);      //id
                tmp.push(sp);           //sp
                tmp.push(ep);           //ep   
                tmp.push(-1);           //address  
                tmp.push(-1);           //next address
                data_to_mcu.push(tmp);

                if(i+2<scan_result.length){ //上下左右移
                    tmp = new Array();
                    sp = ep;
                    ep ={
                        'lat': scan_result[i+2].lat,
                        'lon': scan_result[i+2].lng
                    };
    
                    tmp.push(count++);      //id
                    tmp.push(sp);           //sp
                    tmp.push(ep);           //ep   
                    tmp.push(-1);           //address 
                    tmp.push(-1);           //next address 
                    data_to_mcu.push(tmp);

                    draw_tmp = new Array();
                    draw_tmp.push(sp);
                    draw_tmp.push(ep);
                    draw_path(draw_tmp);
                }
                
            }
        }


		handle_shape_path_lines(data_to_mcu);
		shape_path_lines_sort_by_epLat(); //依EP.lat進行排序
        shape_path_set_next_address();
        shape_path_sep_cursor();
        shape_path_sep_differ();
        shape_path_lines_nsew_area();
        data_to_file = shape_path_data_to_file();
		//console.log(shape_path_lines);
    }
    else alert("未輸入間隔距離");
}

//計算座標是否坐落於框選範圍
function IsPtInPoly() {
	var iSum = 0,
		iCount;
	var dLon1, dLon2, dLat1, dLat2, dLon;
	if (shape_path_points.length < 3) return false;
	iCount = shape_path_points.length;
	for (var i = 0; i < iCount; i++) {
		if (i == iCount - 1) {
			dLon1 = shape_path_points[i].lng;
			dLat1 = shape_path_points[i].lat;
			dLon2 = shape_path_points[0].lng;
			dLat2 = shape_path_points[0].lat;
		} else {
			dLon1 = shape_path_points[i].lng;
			dLat1 = shape_path_points[i].lat;
			dLon2 = shape_path_points[i + 1].lng;
			dLat2 = shape_path_points[i + 1].lat;
		}
		//以下語句判斷A點是否在邊的兩端點的水平平行線之間，在則可能有交點，開始判斷交點是否在左射線上
		if (((user_location.lat >= dLat1) && (user_location.lat < dLat2)) || ((user_location.lat >= dLat2) && (user_location.lat < dLat1))) {
			if (Math.abs(dLat1 - dLat2) > 0) {
				//得到 A點向左射線與邊的交點的x座標：
				dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - user_location.lat)) / (dLat1 - dLat2);
				if (dLon < user_location.lng) iSum++;
			}
		}
	}
	if (iSum % 2 != 0){      
        return true;
    }
	return false;
}

//依照期望路徑方向取得掃描線方向
function getScanDirection(dir){
    let result;
    switch(dir){
        case 'NSEW':
        case 'NSWE':
        case 'SNEW':
        case 'SNWE':
            result = "vertical";    //垂直方向
            break;
        case 'EWNS':
        case 'EWSN':
        case 'WENS':
        case 'WESN':
            result = "horizontal";  //水平方向
            break;
    }
    return result;
}

//取得垂直掃描線清單
function get_vertical_scanner_line(distance){
    let scanner_list = new Array(); //掃描線清單

    var min_lng = shape_path_points[0].lng; //假設最小經度為shape_path_points[0]的經度
    var max_lng = shape_path_points[0].lng; //假設最大經度為shape_path_points[0]的經度
    var min_lat = shape_path_points[0].lat; //假設最小緯度為shape_path_points[0]的緯度
    var max_lat = shape_path_points[0].lat; //假設最大緯度為shape_path_points[0]的緯度

    for(var i=0; i<shape_path_points.length;i++){   //走訪座標清單
        if(min_lng > shape_path_points[i].lng) min_lng = shape_path_points[i].lng;  //找最小經度
        if(max_lng < shape_path_points[i].lng) max_lng = shape_path_points[i].lng;  //找最大經度
        if(min_lat > shape_path_points[i].lat) min_lat = shape_path_points[i].lat;  //找最小緯度
        if(max_lat < shape_path_points[i].lat) max_lat = shape_path_points[i].lat;  //找最大緯度
    }

    let dist = distance * 0.00000900900901; //公尺轉經緯度: 1公尺約0.00000900900901度
    let index = 0;
    while(min_lng + index * dist <= max_lng){   //建置垂直掃描線(經線)
        let sp1 = {
            'lat': min_lat,
            'lng': min_lng + index * dist
        };
        let sp2 = {
            'lat': max_lat,
            'lng': min_lng + index * dist
        };
        scanner_list.push([sp1, sp2]);
        index = index + 1;
    }
    index = 0;
    return scanner_list;
}

//取得水平掃描線清單
function get_horizontal_scanner_line(distance){
    let scanner_list = new Array(); //掃描線清單

    var min_lng = shape_path_points[0].lng; //假設最小經度為shape_path_points[0]的經度
    var max_lng = shape_path_points[0].lng; //假設最大經度為shape_path_points[0]的經度
    var min_lat = shape_path_points[0].lat; //假設最小緯度為shape_path_points[0]的緯度
    var max_lat = shape_path_points[0].lat; //假設最大緯度為shape_path_points[0]的緯度

    for(var i=0; i<shape_path_points.length;i++){   //走訪座標清單
        if(min_lng > shape_path_points[i].lng) min_lng = shape_path_points[i].lng;  //找最小經度
        if(max_lng < shape_path_points[i].lng) max_lng = shape_path_points[i].lng;  //找最大經度
        if(min_lat > shape_path_points[i].lat) min_lat = shape_path_points[i].lat;  //找最小緯度
        if(max_lat < shape_path_points[i].lat) max_lat = shape_path_points[i].lat;  //找最大緯度
    }

    let dist = distance * 0.00000900900901; //公尺轉經緯度: 1公尺約0.00000900900901度
    let index = 0;
    while(min_lat + index * dist <= max_lat){   //建置水平掃描線(緯線)
        let sp1 = {
            'lat': min_lat + index * dist,
            'lng': min_lng
        };
        let sp2 = {
            'lat': min_lat + index * dist,
            'lng': max_lng
        };
        scanner_list.push([sp1, sp2]);
        index = index + 1;
    }
    index = 0;

    return scanner_list;
}

//透過垂直掃描線掃描圖形
function vertical_scan(scanner_list){
    let points_on_edges_of_graphics = new Array();

    for(var index=0; index<shape_path_points.length; index++){
        if(index < shape_path_points.length-1){
            //L.polyline([shape_path_points[index], shape_path_points[index + 1]], { color: ' red ' }).addTo(map);  //繪製被掃描線
            for(var i=0; i<scanner_list.length; i++){
                //L.polyline(scanner_list[i], { color: ' blue ' }).addTo(map);  //繪製掃描線
                let result = segmentsIntr(scanner_list[i][0], scanner_list[i][1], shape_path_points[index], shape_path_points[index + 1]);
                if(result != false){
                    points_on_edges_of_graphics.push(result);
                }
            }
        }else{
            //L.polyline([shape_path_points[index], shape_path_points[0]], { color: ' red ' }).addTo(map);  //繪製被掃描線
            for(var i=0; i<scanner_list.length; i++){
                //L.polyline(scanner_list[i], { color: ' blue ' }).addTo(map);  //繪製掃描線
                let result = segmentsIntr(scanner_list[i][0], scanner_list[i][1], shape_path_points[index], shape_path_points[0]);  //頭尾相接
                if(result != false){
                    points_on_edges_of_graphics.push(result);
                }
            }
        }
    }

    return points_on_edges_of_graphics;
}

//透過水平掃描線掃描圖形
function horizontal_scan(scanner_list){
    let points_on_edges_of_graphics = new Array();

    for(var index=0; index<shape_path_points.length; index++){
        if(index < shape_path_points.length-1){
            //L.polyline([shape_path_points[index], shape_path_points[index + 1]], { color: ' red ' }).addTo(map);  //繪製被掃描線
            for(var i=0; i<scanner_list.length; i++){
                //L.polyline(scanner_list[i], { color: ' blue ' }).addTo(map);  //繪製掃描線
                let result = segmentsIntr(scanner_list[i][0], scanner_list[i][1], shape_path_points[index], shape_path_points[index + 1]);
                if(result != false){
                    points_on_edges_of_graphics.push(result);
                }
            }
        }else{
            //L.polyline([shape_path_points[index], shape_path_points[0]], { color: ' red ' }).addTo(map);  //繪製被掃描線
            for(var i=0; i<scanner_list.length; i++){
                //L.polyline(scanner_list[i], { color: ' blue ' }).addTo(map);  //繪製掃描線
                let result = segmentsIntr(scanner_list[i][0], scanner_list[i][1], shape_path_points[index], shape_path_points[0]);  //頭尾相接
                if(result != false){
                    points_on_edges_of_graphics.push(result);
                }
            }
        }
    }
    
    return points_on_edges_of_graphics;
}

//求交點座標
function segmentsIntr(sp1, sp2, up1, up2){  
    let a = {
        x: sp1.lng,
        y: sp1.lat
    };
    let b = {
        x: sp2.lng,
        y: sp2.lat
    };
    let c = {
        x: up1.lng,
        y: up1.lat
    };
    let d = {
        x: up2.lng,
        y: up2.lat
    };

    var nx=b.y - a.y,   
    ny=a.x - b.x;  
    var normalLine = {  x: nx, y: ny }; 
    var dist= normalLine.x*c.x + normalLine.y*c.y;  

    var nx1 = (b.y - a.y), ny1 = (a.x - b.x);  //線段ab的法線N1 
    var nx2 = (d.y - c.y), ny2 = (c.x - d.x);  //線段cd的法線N2 

    
    var denominator = nx1*ny2 - ny1*nx2;  //兩條法線做交叉相乘  
    if (denominator==0) return false;   //如果結果為0, 說明線段ab和線段cd平行或共線,不相交

    //在法線N2上的投影  
    var distC_N2=nx2 * c.x + ny2 * c.y;  
    var distA_N2=nx2 * a.x + ny2 * a.y-distC_N2;  
    var distB_N2=nx2 * b.x + ny2 * b.y-distC_N2;  

    
    if ( distA_N2*distB_N2>=0  ) return false;// 點a投影和點b投影在點c投影同側 (對點在線段上的情況當作不相交處理);

    //在法線N1上的投影  
    var distA_N1=nx1 * a.x + ny1 * a.y;  
    var distC_N1=nx1 * c.x + ny1 * c.y-distA_N1;  
    var distD_N1=nx1 * d.x + ny1 * d.y-distA_N1;  
    if ( distC_N1*distD_N1>=0  ) {  
        return false;  
    }  

    //計算交點坐標  
    var fraction= distA_N2 / denominator;  
    var dx= fraction * ny1, dy= -fraction * nx1;

    let result = {
        'lat': a.y + dy,
        'lng': a.x + dx
    }

    return result;
}

//進行排序
function sort_list(list, dir){
    switch(dir){
        case 'NSEW':
            sort_lat(list); //NS
            sort_lng(list); //EW
            break;
        case 'NSWE':
            sort_lat(list); //NS
            sort_lng2(list);//WE
            break;
        case 'SNEW':
            sort_lat2(list);//SN
            sort_lng(list); //EW
            break;
        case 'SNWE':
            sort_lng2(list);//SN
            sort_lat2(list);//WE
            break;
        case 'EWNS':
            sort_lng(list); //EW
            sort_lat(list); //NS
            break;
        case 'EWSN':
            sort_lng(list); //EW
            sort_lat2(list);//SN
            break;
        case 'WENS':
            sort_lng2(list);//WE
            sort_lat(list); //NS
            break;
        case 'WESN':
            sort_lng2(list);//WE
            sort_lng2(list);//SN
            break;
    }
}

function sort_lat(list){
    list.sort(function(p1, p2){    //以lat為基準進行排序(N->S)
		return p2.lat - p1.lat;
	});
}

function sort_lat2(list){
	list.sort(function(p1, p2){    //以lat為基準進行排序(S->N)
		return p1.lat - p2.lat;
	});
}

function sort_lng(list){
	list.sort(function(p1, p2){    //以lng為基準進行排序(E->W)
		return p2.lng - p1.lng;
	});
}

function sort_lng2(list){
	list.sort(function(p1, p2){    //以lng為基準進行排序(W->E)
		return p1.lng - p2.lng;
	});
}

//繪製路線
function draw_path(list){
    L.polyline(list,{color: 'blue'}).addTo(map);
}

function handle_shape_path_lines(data_to_mcu){
	let arr = new Array();
	for(var i=0;i<data_to_mcu.length;i++){
		var tmp = {
			"id": i+1,
			"sp": data_to_mcu[i][1],
			"ep": data_to_mcu[i][2],
		};
		arr.push(tmp);
	}
	shape_path_lines = arr;
}

//打包並回傳資料
function data_package(){
    let data_list = new Array();    //打包好的bin檔案
    

    let data_info = new Uint8Array(new ArrayBuffer(16));  //檔案資訊
    data_info[0] = new Date().getMonth()+1  //月
    data_info[1] = new Date().getDate();    //日
    if(shape_path_lines.length < 256){ //資料長度
        data_info[2] = 0;
        data_info[3] = shape_path_lines.length;
    }else{
        data_info[2] = parseInt(shape_path_lines.length / 256);
        data_info[3] = parseInt(shape_path_lines.length % 256);
    }

    data_list.push(data_info);


    for(var i=0; i<shape_path_lines.length; i++){
        var data_ep = {
            'nsew_area':get_nsew_area(shape_path_lines[i][2].lat, shape_path_lines[i][2].lon),
            'lat':parseInt(shape_path_lines[i][2].lat * 1000000),  //結束點緯度
            'lon':parseInt(shape_path_lines[i][2].lon * 1000000),  //結束點經度
            'cursor':parseInt(get_point_cursor(shape_path_lines[i][1], shape_path_lines[i][2]) / 2),
            'next_address':shape_path_lines[i][4],
            'lat_differ':get_point_differ(parseInt(shape_path_lines[i][1].lat * 1000000), parseInt(shape_path_lines[i][2].lat * 1000000)),
            'lon_differ':get_point_differ(parseInt(shape_path_lines[i][1].lon * 1000000), parseInt(shape_path_lines[i][2].lon * 1000000)),
        }; 

        let arr = new Uint8Array(new ArrayBuffer(16));
        arr[0] = data_ep.nsew_area;
        arr[1] = (data_ep.lat>>24) & 0xFF;
        arr[2] = (data_ep.lat>>16) & 0xFF;
        arr[3] = (data_ep.lat>>8) & 0xFF;
        arr[4] = (data_ep.lat) & 0xFF;
        arr[5] = (data_ep.lon>>24) & 0xFF;
        arr[6] = (data_ep.lon>>16) & 0xFF;
        arr[7] = (data_ep.lon>>8) & 0xFF;
        arr[8] = (data_ep.lon) & 0xFF;
        arr[9] = (parseInt(data_ep.next_address)>>8) & 0xFF;
        arr[10] = (parseInt(data_ep.next_address)) & 0xFF;
        arr[11] = parseInt(data_ep.cursor / 2);
        arr[12] = data_ep.lat_differ[0];
        arr[13] = data_ep.lat_differ[1];
        arr[14] = data_ep.lon_differ[0];
        arr[15] = data_ep.lon_differ[1];

        if(arr[10] == 255){
            arr[9] = 255;
        }
        
        data_list.push(arr);

        console.log(shape_path_lines[i]);
    }

    let arr = new Uint8Array(new ArrayBuffer(16));
    for(var i = 0; i < 16; i++){
        arr[i] = 255;
    }
    data_list.push(arr);

    return data_list;
}

function shape_path_lines_sort_by_epLat() {
    const coords = shape_path_lines;
    const n = coords.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (coords[j].ep.lat > coords[j + 1].ep.lat) {
                [coords[j], coords[j + 1]] = [coords[j + 1], coords[j]];
            }
        }
    }

    shape_path_lines = coords
}

function shape_path_set_next_address(){
    let temp = new Array();
    shape_path_lines.forEach(line => {
        var target = line.id+1;
        let next_address = -1;
        for(var i=0;i<shape_path_lines.length;i++){
            if(shape_path_lines[i].id == target){
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
    shape_path_lines = temp;
}

function shape_path_sep_cursor(){
    let temp = new Array();
    shape_path_lines.forEach(line => {
        const dLon = (line.ep.lon - line.sp.lon) * Math.PI / 180;
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
    shape_path_lines = temp;
}

function shape_path_sep_differ(){
    let temp = new Array();
    shape_path_lines.forEach(line => {
        let cell = {
            "id": line.id,
            "sp": line.sp,
            "ep": line.ep,
            "cursor": line.cursor,
            "next": line.next,
            "diff": {
                "lat_diff": line.sp.lat - line.ep.lat,
                "lon_diff": line.sp.lon - line.ep.lon
            },
        };
        temp.push(cell);
    });
    shape_path_lines = temp;
}

function shape_path_lines_nsew_area(){	//判讀東西經及南北緯
    let temp = new Array();
    shape_path_lines.forEach(line => {
        var area = -1;
        if(line.ep.lat > 0 && line.ep.lon > 0){
            area = 17;	//17(dec) = 11(hex)
        }else if(line.ep.lat > 0 && line.ep.lon < 0){
            area = 16;	//16(dec) = 10(hex)
        }else if(line.ep.lat < 0 && line.ep.lon > 0){
            area = 1;	//1(dec) = 01(hex)
        }else if(line.ep.lat < 0 && line.ep.lon < 0){
            area = 0;	//0(dec) = 00(hex)
        }

        let cell = {
            "id": line.id,
            "nsew": area,
            "sp": line.sp,
            "ep": line.ep,
            "cursor": line.cursor,
            "next": line.next,
            "diff": {
                "lat_diff": line.sp.lat - line.ep.lat,
                "lon_diff": line.sp.lon - line.ep.lon
            },
        };
        temp.push(cell);
    });

    shape_path_lines = temp;
}

function shape_path_data_to_file(){
    var data_list = new Array();
    let data_info = new Uint8Array(new ArrayBuffer(16));  //檔案資訊
    data_info[0] = new Date().getMonth()+1  //月
    data_info[1] = new Date().getDate();    //日
    if(shape_path_lines.length < 256){ //資料長度
        data_info[2] = 0;
        data_info[3] = shape_path_lines.length;
    }else{
        data_info[2] = (shape_path_lines.length >> 8) & 0xFF;
        data_info[3] = shape_path_lines.length & 0xFF;
    }

    data_list.push(data_info);

    shape_path_lines.forEach(line => {
        let arr = new Uint8Array(new ArrayBuffer(16));
        arr[0] = line.nsew;
        arr[1] = ((line.ep.lat * 1000000)>>24) & 0xFF;
        arr[2] = ((line.ep.lat * 1000000)>>16) & 0xFF;
        arr[3] = ((line.ep.lat * 1000000)>>8) & 0xFF;
        arr[4] = (line.ep.lat * 1000000) & 0xFF;
        arr[5] = ((line.ep.lon * 1000000) >>24) & 0xFF;
        arr[6] = ((line.ep.lon * 1000000) >>16) & 0xFF;
        arr[7] = ((line.ep.lon * 1000000) >>8) & 0xFF;
        arr[8] = (line.ep.lon * 1000000) & 0xFF;
        arr[9] = shape_path_set_next_address_format(line.next)[0];
        arr[10] = shape_path_set_next_address_format(line.next)[1];
        arr[11] = parseInt(line.cursor / 2);
        arr[12] = shape_path_set_diff_format(line.diff.lat_diff)[0];
        arr[13] = shape_path_set_diff_format(line.diff.lat_diff)[1];
        arr[14] = shape_path_set_diff_format(line.diff.lon_diff)[0];
        arr[15] = shape_path_set_diff_format(line.diff.lon_diff)[1];
    
        data_list.push(arr);
    });

    arr = new Uint8Array(new ArrayBuffer(16));
    for(var i = 0; i < 16; i++){
        arr[i] = 255;
    }
    data_list.push(arr);
    
    return data_list;
}

function shape_path_set_next_address_format(next_address){
    var data = new Uint8Array(new ArrayBuffer(2));
    
    if(next_address == -1){
        data[0] = 0xFF;
        data[1] = 0xFF;
    }else if(next_address < 256){
        data[0] = 0xFF;
        data[1] = next_address & 0xFF;
    }else{
        data[0] = (next_address >> 8) & 0xFF;
        data[1] = next_address & 0xFF;
    }
    return data;
}

function shape_path_set_diff_format(diff){
    diff = diff * 1000000;
    if(diff < 0){
        diff = 0xFFFF + diff + 1; // 將差轉換為二補數表示法
    }

    var data = new Uint8Array(new ArrayBuffer(2));
    
    data[0] = (diff >> 8) & 0xFF;
    data[1] = diff & 0xFF;

    return data;
}