var map,popup,promptPopup;
var markers;//预警信息图层
var stationMarkers;//收费站图层
var closedroadMarkers;//封路信息图层
var nationRoadMarkers;//国道信息图层
var airportMarkers; //机场信息图层
//var airTextLayer,features = []; //机场文字图层
var currentZoom = 2;//当前设置的缩放级别(自己规定)
var selectBtnState; // 菜单选中标示, 国道：GD，高速:GS , 图例：TL , 机场：JC 
var radarWms;
$(document).ready(function() {
 
	function mapClick(event)
	{
		if (popup != null) {
			   map.removePopup(popup);
		   }
		if (selectedMarker != null)
		   {
		   		selectedMarker.src = "/static/images/icons/marker.png";
		   
		   }
	}
	
	
	 $("#keywordName").each(function(){
	     var thisVal=$(this).val();
	     //判断文本框的值是否为空，有值的情况就隐藏提示语，没有值就显示
	     if(thisVal!=""){
	       $(this).siblings("span").hide();
	      }else{
	       $(this).siblings("span").show();
	      }
	     //聚焦型输入框验证 
	     $(this).focus(function(){
	       $(this).siblings("span").hide();
	      }).blur(function(){
	        var val=$(this).val();
	        if(val!=""){
	         $(this).siblings("span").hide();
	        }else{
	         $(this).siblings("span").show();
	        } 
	      });
	    })
	map = new WebtAPI.WMap(document.getElementById("mapDiv"),{
        eventListeners: {
            "click": mapClick
        }
    });
	
//     radarWms = new OpenLayers.Layer.WMS( "DM Solutions Demo",
//              "http://10.14.85.79:8399/arcgis/services/service/leida/MapServer/WMSServer",
//              {layers: "bathymetry,land_fn,park,drain_fn,drainage," +
//                       "prov_bound,fedlimit,rail,road,popplace",
//               transparent: "true", format: "/static/images/icons/marker.png" });
	 
	 radarWms = new OpenLayers.Layer.WMS(   
			 'Base layer', 
			 'http://vmap0.tiles.osgeo.org/wms/vmap0',  
			 { layers: 'basic' },   
			 { isBaseLayer: true } 
	 );
    	 
	var oldZoom;
	map.events.register("zoomend", this, function(e){
		if(selectBtnState == "JC"){
			if(map.zoom<currentZoom && oldZoom<currentZoom){
				oldZoom = map.zoom;
				return;
			}else if(map.zoom>=currentZoom && oldZoom>=currentZoom){
				oldZoom = map.zoom;
				return;
			}else{
				oldZoom = map.zoom;
				airportInfo(map.zoom);
			}
		}
	});
	
	map.minZoom = 4;
	map.maxZoom = 9;
	map.initZoom = 0;
	map.numZoomLevels = 6;
	map.setCenterByLonLat(new OpenLayers.LonLat(108.4074, 34.9046),0);
	map.addControl(new OpenLayers.Control.PanZoomBar());
    
	$(".close").click(
		function(){
			//$("#alarmcontentDiv").animate({right:'-150px'},"slow");
			$('#alarmcontentDiv').css({"display":"none"});
			$('#closedroadDiv').css({"display":"none"});
		}
	);
	alarmInfo();
	closeSide();
	closedroadInfo();

	$('#alarmcontentDiv').css({"display":"none"});
	$('#superwayDiv').css({"display":"none"});
	$('#closedroadDiv').css({"display":"none"});
});

// 改变span默认内容和文本框文本
function changeDefaultText() {

    if(selectBtnState == "GD") {
    	$("#defaultText").html("查询国道");
    	$("#keywordName").val("");
    	$("#keywordName").siblings("span").show();
    } else if(selectBtnState == "GS") {
    	$("#defaultText").html("查询高速");
    	$("#keywordName").val("");
    	$("#keywordName").siblings("span").show();
    }
    
}

// 按钮触发方法
function changeMenu(type) {
	  if (popup != null) {
		   map.removePopup(popup);
	  }
	  if(closedroadMarkers != null) {
		  closedroadMarkers.destroy();
	  }
	//国道：GD，高速:GS , 图例：TL , 机场：JC 
	switch(type) {
	   case 'GD': 
	       selectBtnState = 'GD';
	       changeDefaultText(); 
	       nationRoadInfo();
	       break;
	   case 'GS': 
	       selectBtnState = 'GS';
	   	   changeDefaultText(); 
		   superwayInfo();
	       break;
	   case 'TL': 
	       selectBtnState = 'TL';
		   alarmInfo();
		   alarmInfo2();
	       break;
	   case 'JC':
	       selectBtnState = 'JC';
		   airportInfo(map.zoom);
	       break;
	}
}

function closeSuperway(){
	$('#superwayDiv').css({"display":"none"});
	map.removeLayer(stationMarkers);
}
var superwayHtml;


// 查询框搜索匹配
function searchMapping() {
	var keywordName =  $("#keywordName").val();
	if(selectBtnState == "GS") {
		var superwayArr = superways.data;
		var gs;
		for(index in superwayArr){
			var wayjson=superwayArr[index];//转换为json对象 
			for(gs in wayjson){
				if(keywordName==wayjson[gs]) {
					$("#keywordIndex").val(gs);
				}
			}
		} 
		keywordName = $("#keywordIndex").val();
		querySuperway(keywordName);
	} else if(selectBtnState == "GD"){
		keywordName = $("#keywordName").val();
		queryNationRoad(keywordName);
	}
}


function superwayInfo(){
	$(".an02").css("background","#5498DF");
	$("#superway").css("background","#0145a1");
	superwayHtml="<ul class='liebiao'>";
	var superwayArr = superways.data;
	for(index in superwayArr){
		var wayjson=superwayArr[index];//转换为json对象 
		for(gs in wayjson){
			superwayHtml += "<li style='list-style-type:square;width:80px;' id='gs"+gs+"'><a  href='#' onclick=querySuperway('"+gs+"');selectSuperWay('"+wayjson[gs]+'\,'+gs+"')>"+wayjson[gs]+'</a></li>';
		}
	}

	superwayHtml+="</ul>";
	$('#superwayDiv').css({"display":"block"});
	$('#alarmcontentDiv').css({"display":"none"});
	$('#closedroadDiv').css({"display":"none"});
	
	// 右侧栏显示
	$('#side').css({"display":"block"});
	$('#guanbi').css({"display":"block"});
	$('#sh').css({"display":"block"});
	
	$("#MapInfo").css("display","block");
	$("#superwayDiv").css("display","block");
	$("#contents").css("display","block");
	
	$("#superwaybuttonsDiv").css("right", 150);
	$("#alarmbuttonsDiv").css("right", 150);
	$("#airportbuttonsDiv").css("right", 150);
	$("#nationRoadbuttonsDiv").css("right", 150);
	$("#radarbuttonsDiv").css("right", 150);
	
	$('#superwaycontentDiv').html(superwayHtml);
	$('#superwaycontentDiv').css("display","block");

}


var selectedGS="";
// 查询高速路
function querySuperway(code){
	
	if(nationRoadMarkers != null) {
		nationRoadMarkers.destroy();
	}
	if(airportMarkers != null) {
		airportMarkers.destroy();
	}
	if (selectedGS!="")
	{
		$('#gs'+selectedGS).find("a").css({"font-weight":"normal", "color":"#3366BB"});
	}
	$('#gs'+code).find("a").css({"font-weight":"bold","color":"red"});
	selectedGS=code;
	$.ajax({
		  type: 'POST',
		  url: "/station",
		  data: {code:code},
		  success: stationInfoCallback,
		  dataType: "json"
	});
}
function stationInfoCallback(data, textStatus){
	if(textStatus == "success"){
		var jsonArr = data;
		var featureArr=[];
		if(stationMarkers != null){
			stationMarkers.destroy();
		   // map.removeLayer(markers);
		}
		stationMarkers = new OpenLayers.Layer.Markers("stationsMarkers");
		
	    map.addLayer(stationMarkers);
		for(index in jsonArr){
			addStationsMarkerFC(jsonArr[index]);
		}
		var stationsExtent=stationMarkers.getDataExtent();
		map.zoomToExtent(stationsExtent,false);
		
	}else{
		
	}
}

var currentCount=0;
function changeYBcontent(flag){
	if(flag == 'next'){
		currentCount++;
	}else{
		currentCount--;
	}
	if(ybList.length<=currentCount){
		currentCount = 0;
	}else if(currentCount<0){
		currentCount = ybList.length-1;
	}
	var startTime = ybList[currentCount].time_start;
	startTime = startTime.split(" ")[1];
	var endTime = ybList[currentCount].time_end;
	endTime = endTime.split(" ")[1];
	startTime = startTime.split(":")[0]+":00";
	endTime = endTime.split(":")[0]+":00";
	//如果jf=0 说明无降水无降雪 则不显示
	//如果js=1 则js表示为降水量 
	//如果js=2 则js表示为降雪量
	var loadCount="";
	if(ybList[currentCount].jf == '0'){
		
	}else if(ybList[currentCount].jf == '1'){
		loadCount = "<font size='2px'>降水量:"+ybList[currentCount].js+"mm</font>";
	}else if(ybList[currentCount].jf == '2'){
		loadCount = "<font size='2px'>降雪量:"+ybList[currentCount].js+"mm</font>";
	}
	
	$("#dateRangeId").html("<font size='2px'>"+startTime+"-"+endTime+"</font>");
  	var ybHtml ="<font size='2px'>"+ybList[currentCount].weather+"</font><img src='static/images/icons/icon24_24/"+ybList[currentCount].img+".gif'/><br/>";
  	ybHtml +="<font size='2px'>"+ybList[currentCount].temp2+"℃---"+ybList[currentCount].temp1+"℃</font><br/>";
  	ybHtml +="<font size='2px'>"+ybList[currentCount].fx+ybList[currentCount].fl+"</font><br/>";
  	ybHtml +=loadCount;
  	$("#weatherId").html(ybHtml);
	
}

var selectedMarker=null;
var ybList; //精细化预报列表

//显示收费站的普通天气预报
function addStationsMarkerFC(station) {
	var lonlat = WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(station.lon, station.lat)); //EPSG:900913
    var size = new OpenLayers.Size(32,37);
    var iconUrl="/static/images/icons/marker.png"; 
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    var icon = new OpenLayers.Icon(iconUrl,size,offset);
    var marker = new OpenLayers.Marker(lonlat,icon);
    marker.events.register("mousemove",this,function(evt)
    		{
    			if (evt.srcElement != selectedMarker)
    				{
    					evt.srcElement.alt=station.gsmc+","+station.sfz;
    					evt.srcElement.src = "/static/images/icons/hmarker.png";
    				}
    		});
    marker.events.register("mouseout",this,function(evt)
    		{
    			
    			if (evt.srcElement != selectedMarker){
    			evt.srcElement.alt="";
    			
    			evt.srcElement.src = "/static/images/icons/marker.png";}
    			
    		});
    marker.events.register('click',this,function(evt){
	   if (popup != null) {
		   map.removePopup(popup);
	   }
	   if (selectedMarker != null)
		   {
		   		selectedMarker.src = "/static/images/icons/marker.png";
		   
		   }
	   
	 //  selectedMarker = evt.srcElement;
	//   selectedMarker.src = "/static/images/logo.jpg";
	   $.post("/cityforecast", { Action: "post", cityid:station.areaid,skid:station.skid,rStationId:station.r_stationId},
			   function (data, textStatus){
  			ybList = [];
  		   //{"sk_info":{"date":"20110406","cityName":"北京","areaID":"101010100","temp":"16","tempF":"60.8","wd":"西南风","ws":"4","sd":"40%","time":"13:40","isRadar":"1","Radar":"JC_RADAR_AZ9010_JB"}}
		   //{"weatherinfo":{"date_y":"2012-09-24","city":"栾城收费站","LONGITUDE":"114.59","LATITUDE":"37.95","data":[{"weather":"多云","img":"3","temp1":"27","temp2":"19","fx":"东南风","fl":"软风","js":"0～1","time_start":"2012-09-24 08:09:00","time_end":"2012-09-24 14:09:00"},{"weather":"多云","img":"3","temp1":"27","temp2":"21","fx":"东南风","fl":"轻风","js":"0～1","time_start":"2012-09-24 14:09:00","time_end":"2012-09-24 20:09:00"},{"weather":"多云","img":"3","temp1":"21","temp2":"18","fx":"东南风","fl":"轻风","js":"0～1","time_start":"2012-09-24 20:09:00","time_end":"2012-09-25 02:09:00"},{"weather":"小雨","img":"5","temp1":"18","temp2":"17","fx":"东风","fl":"软风","js":"0～1","time_start":"2012-09-25 02:09:00","time_end":"2012-09-25 08:09:00"}]}}
  			var skHtml;
  			var skContent = data.skContent;
  			var skjson;
  			//alert(data.ybContent)
  			var ybContent = data.ybContent;
  			
		  	var ybjson=eval("("+ybContent+")");//转换为json对象 
		  	var ybObj = ybjson.weatherinfo;
		  	
  			try{
  				var skTempdata = skContent.split("=")[1];
			  	skjson=eval("("+skTempdata+")");//转换为json对象 
			  	var skObj = skjson.sk_info;
			  	//var skHtml = "<div class='fei'>";
			  	//"+skObj.date+"
			  	var temprature = (skObj.temp).indexOf("9999")==-1?skObj.temp+"℃":'暂无';
			  	var shidu = (skObj.sd).indexOf("9999")==-1?skObj.sd:'暂无';
			  	var jiangshui="";
			  	if((typeof(skObj.js) != "undefined") && (skObj.js).indexOf("9999")==-1 && skObj.js !=''){
			  		jiangshui =skObj.js+"mm";
			  	}
			  	else
			  	{
			  		jiangshui="暂无";
			  	}
			  	var cityName="";
			  	if(skObj.cityName.length>12)
			  	{
			  		cityName=skObj.cityName.substring(0,12)+"...";
			  	}
			  	else
			  	{
			  		cityName=skObj.cityName;
			  	}
			  	skHtml ="<div class='fei'><h1><a alt="+skObj.cityName+">"+cityName+"</a></h1>";
			  	skHtml +="<ul><li class='wei'>当前实况</li><li>温度："+temprature+"</li><li>风："+skObj.wd+"&nbsp;"+skObj.ws+"级</li><li>湿度："+shidu+"</li><li>降水："+jiangshui+"</li></ul>";

  			}catch(err){
  				skHtml = "<div class='fei'>";
			    skHtml +="<h1>暂无实况信息</h1>";
			    skHtml +="<ul><li class='wei'>当前实况</li><li>温度：</li><li>风：</li><li>湿度：</li></ul>";
  			}	
		  	
  			
  			
		  	ybList = ybObj; //获取预报列表
  			var weather1=ybObj.weather1;
  			var fl1=ybObj.fl1;
  			var fchh=ybObj.fchh;
  			var wind1=ybObj.wind1;
  			var cityid=ybObj.cityid;
  			var img1="";
  			var img2="";
  			if(fchh=="18")
  			{
  				if(ybObj.img1.length=="1")
  				{	
  					img1="n0"+ybObj.img1;
					if(ybObj.img2=="99")
					{
						img2="d0"+ybObj.img1;
					}
					else
					{
						if(ybObj.img2.length=="1")
						{
							img2="d0"+ybObj.img2;
						}
						else
						{
							img2="d"+ybObj.img2;
						}
					}
  				}
  				else
  				{
  				    img1="n"+ybObj.img1;
					if(ybObj.img2=="99")
					{
						img2="d"+ybObj.img1;
					}
					else
					{
						if(ybObj.img2.length=="1")
						{
							img2="d0"+ybObj.img2;
						}
						else
						{
							img2="d"+ybObj.img2;
						}
					}
  				   
  				}	

  			}
  			else
  			{
  				if(ybObj.img1.length=="1")
  				{	
  					img1="d0"+ybObj.img1;
					if(ybObj.img2=="99")
					{
						img2="n0"+ybObj.img1;
					}
					else
					{
						if(ybObj.img2.length=="1")
						{
							img2="n0"+ybObj.img2;
						}
						else
						{
							img2="n"+ybObj.img2;
						}
					}
  				}
  				else
  				{
  				    img1="d"+ybObj.img1;
					if(ybObj.img2=="99")
					{
						img2="n"+ybObj.img1;
					}
					else
					{
						if(ybObj.img2.length=="1")
						{
							img2="n0"+ybObj.img2;
						}
						else
						{
							img2="n"+ybObj.img2;
						}
					}
  				   
  				}	
  			}
  			
  			var date_y=ybObj.date_y.substr(7,3);
  			var img_title1=ybObj.img_title1;
  			var img_title2=ybObj.img_title2;
  			var temp1=ybObj.temp1;
  			var city=ybObj.city;
  			
  			
			//var startTime = ybList[0].time_start;
			//startTime = startTime.split(" ")[1];
			
			//var endTime = ybList[0].time_end;
			//endTime = endTime.split(" ")[1];
			//startTime = startTime.split(":")[0]+":00";
			//endTime = endTime.split(":")[0]+":00";
			//"+ybObj.city+"
  			
  	       var ybHtml="<ul class='line'>";
  	       ybHtml +="<li class='wei'><span>"+date_y+fchh+"时发布</span>"+city+"天气预报</li>";
  	       ybHtml +="<li><span><img src='http://www.weather.com.cn/m/i/icon_weather/42x30/"+img1+".gif' alt='"+img_title1+"'/></span>"+weather1+"</li>";
  	       ybHtml +="<li><span><img src='http://www.weather.com.cn/m/i/icon_weather/42x30/"+img2+".gif' alt='"+img_title2+"'/></span>"+temp1+"</li>";
  	       ybHtml +="<li>"+wind1+"</li>";
  	       ybHtml +="</ul><p><span><a href='http://www.weather.com.cn/weather/"+cityid+".shtml' target='_blank'>查看详情>></a></span></p>";
		  

		  	/*2、按照雷达数据释义进行数据分类和服务提示用语调用：
			  	等级	雷达数据	服务提示用语	
			  	0-25dBz	  有强度较弱的雨雪回波，注意交通安全。
			  	26-45dBz  有中等强度的雨雪天气出现，道路湿滑，注意行车安全。
			  	大于45dBz 有较强的雨雪天气出现，减少外出，注意行车安全。
			  	数据说明：-64：无数据，-32：无回波；
		  	*/
		  	// 雷达
		  	var radarContent = data.radarContent;
		  	var radarObj = eval("("+radarContent+")");
		  	var ladar ;
		  	try {
		  	   ladar = parseInt(radarObj.ladar);
		  	}catch(e) {
		  		ladar = -32;
		  	}
		  	var radarHtml = "<ul class='line'><li class='wei'>雷达回波</li><li>";
		  	if(ladar >= 0 && ladar <= 25) {
		  		radarHtml += "有强度较弱的雨雪回波，注意交通安全"
		  	} else if(ladar >= 26 && ladar < 45){
		  		radarHtml += "有中等强度的雨雪天气出现，道路湿滑，注意行车安全"
		  	}  else if(ladar > 45){
		  		radarHtml += "有较强的雨雪天气出现，减少外出，注意行车安全"
		  	} else if(ladar == -64) {
		  		radarHtml += "无数据"
		  	} else {
		  		radarHtml += "无回波"
		  	}
		  	radarHtml +="</li></ul></div>";
		
		  	var result =skHtml+ybHtml+radarHtml;
		  	
	        popup = new OpenLayers.Popup.FramedCloud("featurePopup",
	    		  lonlat,
                 new OpenLayers.Size(350, 350),
                 result,
                 null, true);
	        popup.setBackgroundColor("#B4CA63");
	        stationMarkers.map.addPopup(popup);
										
	   }, "json");
           OpenLayers.Event.stop(evt);	 
       });
    stationMarkers.addMarker(marker);
}

//显示收费站的精细化天气预报
function addStationsMarker(station) {
	var lonlat = WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(station.lon, station.lat)); //EPSG:900913
    var size = new OpenLayers.Size(32,37);
    var iconUrl="/static/images/icons/marker.png"; 
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    var icon = new OpenLayers.Icon(iconUrl,size,offset);
    var marker = new OpenLayers.Marker(lonlat,icon);
    marker.events.register("mousemove",this,function(evt)
    		{
    			if (evt.srcElement != selectedMarker)
    				{
    					evt.srcElement.alt=station.gsmc+","+station.sfz;
    					evt.srcElement.src = "/static/images/icons/hmarker.png";
    				}
    		});
    marker.events.register("mouseout",this,function(evt)
    		{
    			
    			if (evt.srcElement != selectedMarker){
    			evt.srcElement.alt="";
    			
    			evt.srcElement.src = "/static/images/icons/marker.png";}
    			
    		});
    marker.events.register('click',this,function(evt){
	   if (popup != null) {
		   map.removePopup(popup);
	   }
	   if (selectedMarker != null)
		   {
		   		selectedMarker.src = "/static/images/icons/marker.png";
		   
		   }
	   
	   selectedMarker = evt.srcElement;
	   selectedMarker.src = "/static/images/icons/smarker.png";
	   $.post("/superway", { Action: "post", ybid:station.ybid,skid:station.skid},
			   function (data, textStatus){
		   			ybList = [];
		   		   //{"sk_info":{"date":"20110406","cityName":"北京","areaID":"101010100","temp":"16","tempF":"60.8","wd":"西南风","ws":"4","sd":"40%","time":"13:40","isRadar":"1","Radar":"JC_RADAR_AZ9010_JB"}}
				   //{"weatherinfo":{"date_y":"2012-09-24","city":"栾城收费站","LONGITUDE":"114.59","LATITUDE":"37.95","data":[{"weather":"多云","img":"3","temp1":"27","temp2":"19","fx":"东南风","fl":"软风","js":"0～1","time_start":"2012-09-24 08:09:00","time_end":"2012-09-24 14:09:00"},{"weather":"多云","img":"3","temp1":"27","temp2":"21","fx":"东南风","fl":"轻风","js":"0～1","time_start":"2012-09-24 14:09:00","time_end":"2012-09-24 20:09:00"},{"weather":"多云","img":"3","temp1":"21","temp2":"18","fx":"东南风","fl":"轻风","js":"0～1","time_start":"2012-09-24 20:09:00","time_end":"2012-09-25 02:09:00"},{"weather":"小雨","img":"5","temp1":"18","temp2":"17","fx":"东风","fl":"软风","js":"0～1","time_start":"2012-09-25 02:09:00","time_end":"2012-09-25 08:09:00"}]}}
		   			var skHtml;
		   			var skContent = data.skContent;
		   			var skjson;
		   			
		   			var ybContent = data.ybContent;
				  	var ybjson=eval("("+ybContent+")");//转换为json对象 
				  	var ybObj = ybjson.weatherinfo;
				  	
		   			try{
		   				var skTempdata = skContent.split("=")[1];
					  	skjson=eval("("+skTempdata+")");//转换为json对象 
					  	var skObj = skjson.sk_info;
					  	var skHtml = "<div id='shikuangDiv'>";
					  	//"+skObj.date+"
					  	var temprature = (skObj.temp).indexOf("9999")==-1?skObj.temp+"℃":'暂无';
					  	var shidu = (skObj.sd).indexOf("9999")==-1?skObj.sd:'暂无';
					  	var jiangshui="";
					  	if((skObj.js).indexOf("9999")==-1 && skObj.js !=''){
					  		jiangshui = "降水:"+skObj.js+"mm";
					  	}
					  	skHtml +="<font size='3px'>"+skObj.cityName+"&nbsp;&nbsp;<b>当前实况</b></font><br/>";
					  	skHtml +="<font size='2px'>温度："+temprature+"&nbsp;&nbsp;风："+skObj.wd+"&nbsp;"+skObj.ws+"级</font><br/>";
					  	skHtml +="<font size='2px'>湿度："+shidu+"&nbsp;&nbsp;"+jiangshui+"</font>";
					  	skHtml +="</div>";
		   			}catch(err){
		   				skHtml = "<div id='shikuangDiv'>";
					    skHtml +="<font size='2px'>暂无实况信息</font></br>";
		   				skHtml +="</div>";
		   			}	
				  	
				  	ybList = ybObj.data; //获取预报列表
					var startTime = ybList[0].time_start;
					startTime = startTime.split(" ")[1];
					
					var endTime = ybList[0].time_end;
					endTime = endTime.split(" ")[1];
					startTime = startTime.split(":")[0]+":00";
					endTime = endTime.split(":")[0]+":00";
					//"+ybObj.city+"
				  	var ybHtml = "<font size='3px'><b>&nbsp;预报</b></font><br/>";
				  	ybHtml += "<a href='#' onclick=\"changeYBcontent('last')\">&lt;&lt;</a>"+"<span id='dateRangeId'><font size='2px'>"+startTime+"-"+endTime+"</font></span>"+"<a href='#' onclick=\"changeYBcontent('next')\">&gt;&gt;</a>"+"<br/>";
				  	ybHtml +="<span id='weatherId'><font size='2px'>"+ybList[0].weather+"</font><img src='static/images/icons/icon24_24/"+ybList[0].img+".gif'/><br/>";
				  	ybHtml +="<font size='2px'>"+ybList[0].temp2+"℃---"+ybList[0].temp1+"℃</font><br/>";
				  	ybHtml +="<font size='2px'>"+ybList[0].fx+ybList[0].fl+"</font><br/>";
					var loadCount="";
					if(ybList[currentCount].jf == '0'){
						
					}else if(ybList[currentCount].jf == '1'){
						loadCount = "<font size='2px'>降水量:"+ybList[0].js+"mm</font>";
					}else if(ybList[currentCount].jf == '2'){
						loadCount = "<font size='2px'>降雪量:"+ybList[0].js+"mm</font>";
					}
					ybHtml +=loadCount;
					ybHtml +="</span>";
				  	var result ="<div>";
				  	//result += data.ybContent+"<br/>";
				  	//result += data.skContent+"<br/>";
				  	result +="	<div id='ybDIV' style='padding:10px;'>"+skHtml+"<div id='ybContent'>"+ybHtml+"</div></div>";
				  	//result +="	<div id='ybDIV' style='padding:10px;'>"+skHtml+"</div>";
			        result +="</div>";
			        popup = new OpenLayers.Popup.FramedCloud("featurePopup",
			    		  lonlat,
		                  new OpenLayers.Size(350, 350),
		                  result,
		                  null, true);
			        popup.setBackgroundColor("#B4CA63");
			        stationMarkers.map.addPopup(popup);
												
			   }, "json");
	    OpenLayers.Event.stop(evt);
    });
    stationMarkers.addMarker(marker);
}

// 图例触发事件2
function alarmInfo2(){
	// 隐藏关闭图层
	$('#kuang01').css({"display":"none"});
	//$('#guanbi').css({"display":"none"});
	$('#sh').css({"display":"none"});
	
	$("#tuli").css("background","#0145a1");
	$("#road").css("background","#5498DF");
	$("#air").css("background","#5498DF");
	$("#superway").css("background","#5498DF");
	$("#radar").css("background","#5498DF");
}

// 图例触发事件1
function alarmInfo(){
	// 右侧栏显示
	$('#MapInfo').css({"display":"block"});
	$('#side').css({"display":"block"});
	$('#guanbi').css({"display":"block"});
	$('#sh').css({"display":"block"});
	
	$("#superwaybuttonsDiv").css("right", 150);
	$("#alarmbuttonsDiv").css("right", 150);
	$("#airportbuttonsDiv").css("right", 150);
	$("#nationRoadbuttonsDiv").css("right", 150);
	$("#radarbuttonsDiv").css("right", 150);
	
	$('#alarmcontentDiv').css({"top":"210px"});
	$('#superwayDiv').css({"display":"none"});
	$('#closedroadDiv').css({"display":"none"});
	$('#contents').css({"display":"none"});
	$('#superwaycontentDiv').css({"display":"none"});
	$('#alarmcontentDiv').css({"display":"block"});
	$('#alarmImg').css({"display":"block"});

	
	
	$.ajax({
		  type: 'POST',
		  url: "/weather",
		  data: {cityCode: "all"},
		  success: function(data, textStatus){
					var jsonArr = data.data;
					if(markers != null){
						markers.destroy();
					   // map.removeLayer(markers);
					}
					
					if(stationMarkers != null) {
						stationMarkers.destroy();
					}
					
					if(closedroadMarkers != null) {
						closedroadMarkers.destroy();
					}
					
					if(nationRoadMarkers != null) {
						nationRoadMarkers.destroy();
					}
					if(airportMarkers != null) {
						airportMarkers.destroy();
					}
					
				    markers = new OpenLayers.Layer.Markers("alrmmarker");
				    map.addLayer(markers);
				    //alert(jsonArr);
					for(index in jsonArr){
						var alarmjson=eval("("+jsonArr[index]+")");//转换为json对象 
						addMarker(alarmjson);
					}
		  },
		  dataType: "json"
		});

	closedroadInfo();
	//closeSide();
} 

function addMarker(alarmjson) {
	var lonlatStrArr = (alarmjson.lonlat).split("_"); 
	var lonlat = WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(lonlatStrArr[0],lonlatStrArr[1]));
    var size = new OpenLayers.Size(38,29);
    var iconUrl;
    //alert(alarmjson);
    if(alarmjson.level.substr(0,1)=="9")
    {
    	if(alarmjson.SIGNALLEVEL=="红色")
		{
			iconUrl = "/static/images/alarm/0000.png";
		}
		else if(alarmjson.SIGNALLEVEL=="蓝色")
		{
			iconUrl = "/static/images/alarm/0003.png";
		}
		else if(alarmjson.SIGNALLEVEL=="橙色")
		{
			iconUrl = "/static/images/alarm/0001.png";
		}
		else if(alarmjson.SIGNALLEVEL=="黄色")
		{
			iconUrl = "/static/images/alarm/0002.png";
		}
		else
		{
			iconUrl = "/static/images/alarm/0000.gif";
		}
    }
    else
    {
    iconUrl = "/static/images/alarm/"+alarmjson.level+".png";
	}
    var city="";
    if(alarmjson.STATIONNAME=="" &&  alarmjson.CITY=="")
    {
    	city=alarmjson.PROVINCE;
    }
    else if(alarmjson.STATIONNAME=="" && alarmjson.CITY!="")
    {
    	city=alarmjson.CITY;
    }
    else
    {
    	city=alarmjson.STATIONNAME;
    }
    //判断预警颜色
    var alarmcolor="";
    var backcolor="";
    if(alarmjson.SIGNALLEVEL=="红色")
    {
       alarmcolor="#ff0000";
       backcolor="";
    }
    else if(alarmjson.SIGNALLEVEL=="蓝色")
    {
    	alarmcolor="#3366bb";
    	backcolor="";
    }
    else if(alarmjson.SIGNALLEVEL=="橙色")
    {
    	alarmcolor="#ff6600";
    	backcolor="";
    }
    else if(alarmjson.SIGNALLEVEL=="黄色")
    {
    	alarmcolor="#ffff00";
    	backcolor="#3366BB";
    }
    else
    {
    	alarmcolor="#000000";
    	backcolor="";
    }
    //alert(iconUrl);
    /*switch(alarmjson.level){
    	
    	case '0902': //雷电黄色
    		iconUrl = "static/images/alarm/0902.png";
    		break;
      	case '0903':
    		iconUrl = "static/images/alarm/0903.png";
    		break;
      	case '0904':
    		iconUrl = "static/images/alarm/0904.png";
    		break;	
    	case '0201': //暴雨蓝色
    		iconUrl = "static/images/alarm/0201.png";
    		break;	
    	case '0202':
    		iconUrl = "static/images/alarm/0202.png";
    		break;
      	case '0203':
    		iconUrl = "static/images/alarm/0203.png";
    		break;
      	case '0204':
    		iconUrl = "static/images/alarm/0204.png";
    		break;
      	case '1003': //冰雹
    		iconUrl = "static/images/alarm/1003.png";
    		break;
      	case '1004':
    		iconUrl = "static/images/alarm/1004.png";
    		break;		
    	case '1202'://大雾
    		iconUrl = "static/images/alarm/1202.png";
    		break;
      	case '1203':
    		iconUrl = "static/images/alarm/1203.png";
    		break;
      	case '1204':
    		iconUrl = "static/images/alarm/1204.png";
    		break;	
    	case '0702'://高温
    		iconUrl = "static/images/alarm/0702.png";
    		break;
      	case '0703':
    		iconUrl = "static/images/alarm/0703.png";
    		break;
      	case '0704':
    		iconUrl = "static/images/alarm/0704.png";
    		break;	
      	case '0101': //台风蓝色
    		iconUrl = "static/images/alarm/0101.png";
    		break;	
    	case '0102':
    		iconUrl = "static/images/alarm/0102.png";
    		break;
      	case '0103':
    		iconUrl = "static/images/alarm/0103.png";
    		break;
      	case '0104':
    		iconUrl = "static/images/alarm/0104.png";
    		break;	
    	case '1302'://霾
    		iconUrl = "static/images/alarm/1302.png";
    		break;
      	case '1303':
    		iconUrl = "static/images/alarm/1303.png";
    		break;	
    }*/
    
    var icon = new OpenLayers.Icon(iconUrl,size,0);
    marker = new OpenLayers.Marker(lonlat,icon);
    marker.events.register('click',this,function(evt){
	   if (popup != null) {
		   map.removePopup(popup);
	   }
	  	var result ="<div class='yj'>"; 
		result +="<h1>"+city+"</h1>";
		result +="<h2 style='color:"+alarmcolor+";background:"+backcolor+"'><span style='float:right;'><img src="+iconUrl+"></span>"+city+alarmjson.SIGNALTYPE+alarmjson.SIGNALLEVEL+"预警</h2>";
		result +="<p><span>发布时间："+alarmjson.ISSUETIME+"</span></p>";
		result +="<p>"+alarmjson.ISSUECONTENT+"</p>";
		//result +="<p><a href='' target='_blank'>查看详情>></a></p>";
        result +="</div>";
	      popup = new OpenLayers.Popup.FramedCloud("featurePopup",
	    		  lonlat,
                  new OpenLayers.Size(300, 250),
                  result,
                  null, true);
        popup.setBackgroundColor("#B4CA63");
        markers.map.addPopup(popup);
	    OpenLayers.Event.stop(evt);
    });
    markers.addMarker(marker);
}
/**
 * @param {Event} evt
 */
function onPopupMouseDown(evt) {
    markers.map.removePopup(popup);
    popup.destroy();
    popup = null;
    OpenLayers.Event.stop(evt);
}

function destroy() {
    popup.destroy();
}

function remove(marker) {
    markers.removeMarker(marker);
}

function removelayer(layer) {
	layer.destroy();
//    map.removeLayer(markers);
}

function closedroadInfo(){
	
	$('#superwayDiv').css({"display":"none"});
	$('#alarmcontentDiv').css({"display":"block"});
	$('#closedroadDiv').css({"display":"none"});

	$.post("/closedroad", { Action: "post" },
		   function (data, textStatus){

		//{"closedroadInfo":["{\"roadinfo\":{\"BLOCK_ID\":\"8a8181d539fce14f013a003a08e00156\",\"REP_USER_PHONE\":\"010-67632686\",\"REPORT_USER_FAX\":\"010-67632686\",\"BLOCK_LOCATION\":\"外环顺义南环\",\"START_STAKE\":\"18,000\",\"END_STAKE\":\"18,000\",\"DETECT_TIME\":\"2012/09/26 09:18:00\",\"ESTIMATE_TIME\":\"2012/09/26 15:18:00\",\"RESUME_TIME\":\"2012/09/26 09:46:00\",\"DIST_ID_LIST\":\"110113\",\"SCENE_DESC\":\"G4501东六环外环由南向北方向K18顺义南环发生两货车追尾事故，占用超车道，后方车辆行驶缓慢。\",\"PHOTO_PATH_LIST\":\"null\",\"NEI_DISID_LIST\":\"null\",\"BLOCK_REASON_ID\":\"141\",\"MEASURES_ID\":\"19\",\"DEAL_METHOD\":\"1、在“北京高速公路网”网站发布路况提示信息。 2、利用道路情报板发布提示信息。 3、集团公司路网各监控中心及收费车道做好提示工作。 4、通过服务热线96011向公众提供路况信息。 5、向交通台上报公路路况信息。 6、路产人员在现场疏导交通。\",\"BLCK_RSN_OTHR\":\"null\",\"MEASURES_OTHER\":\"占用超车道\",\"REPORT1_TIME\":\"2012/09/26 09:38:54\",\"REPORT2_TIME\":\"2012/09/26 09:48:45\",\"AUDIT1_TIME\":\"2012/09/26 09:39:33\",\"AUDIT2_TIME\":\"2012/09/26 09:50:02\",\"PUBLISH1_TIME\":\"2012/09/26 09:40:30\",\"PUBLISH2_TIME\":\"2012/09/26 10:36:01\",\"UNIT_NAME\":\"北京市首都公路发展集团有限公司\",\"IS_MODIFIED\":\"0\",\"SEGMENT_NAME\":\"null\",\"ROAD_ID\":\"G4501\",\"REPORT_USER_NAME\":\"毕爽\",\"BLOCK_REASON\":\"车辆交通事故\",\"UNIT_ID\":\"be902c14-9fcf-41d2-9309-c8a57f4cfb32\",\"MEASURES_NAME\":\"其它\",\"PROVINCE_ID\":\"11\",\"BLOCK_WAY\":\"1\",\"ROAD_NAME\":\"六环路\",\"BLOCK_WAY_TYPE\":\"1\",\"BLOCK_TYPE\":\"1\",\"BRIDGE_OR_TUNNEL_ID\":\"null\",\"BLOCK_MILEAGE\":\"0\",\"OPEN_DESC\":\"null\",\"Coordinate\":\"\",\"MESSAGE_ID\":\"8a8181d539fce14f013a003b7a57015f\",\"MESSAGE_TITLE\":\"G4501线(六环路)北京市顺义区外环顺义南环段因车辆交通事故通行受阻。\",\"MESSAGE_CONTENT\":\"    由于G4501线(六环路)北京市顺义区外环顺义南环段(K18+000至K18+000)发生车辆交通事故，该路段于2012年09月26日09时18分采取交通管制的措施，预计2012年09月26日15时18分恢复通行。请驾驶员注意沿途设立的绕行、禁行等警告、警示标志，小心驾驶。\",\"PUBLISH_USER\":\"路网值班\",\"PUBLISH_TIME\":\"2012/09/26 09:40:28\",\"ROAD_CODE\":\"G4501\",\"BLOCK_SEGMENT\":\"null\",\"DISTRICT\":\"110113\",\"UNIT\":\"北京市首都公路发展集团有限公司\",\"STOPREASON\":\"车辆交通事故\",\"DEAL\":\"其它\"}}","{\"roadinfo\":{\"BLOCK_ID\":\"8a8181d539fce14f0139fed0b56e00e4\",\"REP_USER_PHONE\":\"0359-2533029\",\"REPORT_USER_FAX\":\"null\",\"BLOCK_LOCATION\":\"平陆、平陆北、张店往运城方向封闭\",\"START_STAKE\":\"29,400\",\"END_STAKE\":\"45,500\",\"DETECT_TIME\":\"2012/09/26 02:50:00\",\"ESTIMATE_TIME\":\"2012/09/26 12:50:00\",\"RESUME_TIME\":\"\",\"DIST_ID_LIST\":\"140800\",\"SCENE_DESC\":\"雾大，能见度低\",\"PHOTO_PATH_LIST\":\"null\",\"NEI_DISID_LIST\":\"null\",\"BLOCK_REASON_ID\":\"132\",\"MEASURES_ID\":\"14\",\"DEAL_METHOD\":\"平陆、平陆北、张店往运城方向封闭\",\"BLCK_RSN_OTHR\":\"null\",\"MEASURES_OTHER\":\"null\",\"REPORT1_TIME\":\"2012/09/26 03:04:14\",\"REPORT2_TIME\":\"\",\"AUDIT1_TIME\":\"2012/09/26 03:14:08\",\"AUDIT2_TIME\":\"\",\"PUBLISH1_TIME\":\"2012/09/26 05:14:24\",\"PUBLISH2_TIME\":\"\",\"UNIT_NAME\":\"山西省运城高速公路有限责任公司\",\"IS_MODIFIED\":\"0\",\"SEGMENT_NAME\":\"null\",\"ROAD_ID\":\"S75\",\"REPORT_USER_NAME\":\"尹永军\",\"BLOCK_REASON\":\"雾霾\",\"UNIT_ID\":\"7038c2bb-001c-4338-9c25-eeb5f5e3c957\",\"MEASURES_NAME\":\"封闭收费站出入口\",\"PROVINCE_ID\":\"14\",\"BLOCK_WAY\":\"1\",\"ROAD_NAME\":\"侯马-平陆高速公路\",\"BLOCK_WAY_TYPE\":\"2\",\"BLOCK_TYPE\":\"1\",\"BRIDGE_OR_TUNNEL_ID\":\"null\",\"BLOCK_MILEAGE\":\"16100\",\"OPEN_DESC\":\"null\",\"Coordinate\":\"\",\"MESSAGE_ID\":\"8a8181d539fce14f0139ff47e07100f1\",\"MESSAGE_TITLE\":\"S75线(侯马至平陆高速公路)山西省运城市平陆至张店段因雾霾通行受阻。\",\"MESSAGE_CONTENT\":\"    由于S75线(侯马至平陆高速公路)山西省运城市平陆至张店段(K29+400至K45+500)有雾霾，该路段于2012年09月26日02时50分采取封闭收费站出入口的措施，预计2012年09月26日12时50分恢复通行。请驾驶员注意沿途设立的绕行、禁行等警告、警示标志，小心驾驶。\",\"PUBLISH_USER\":\"路网值班\",\"PUBLISH_TIME\":\"2012/09/26 05:14:24\",\"ROAD_CODE\":\"S75\",\"BLOCK_SEGMENT\":\"null\",\"DISTRICT\":\"140800\",\"UNIT\":\"山西省运城高速公路有限责任公司\",\"STOPREASON\":\"雾霾\",\"DEAL\":\"封闭收费站出入口\"}}","{\"roadinfo\":{\"BLOCK_ID\":\"8a8181d539fce14f0139ffac4c6f0109\",\"REP_USER_PHONE\":\"13501026141\",\"REPORT_USER_FAX\":\"null\",\"BLOCK_LOCATION\":\"温榆桥至五元桥\",\"START_STAKE\":\"7,00\",\"END_STAKE\":\"13,00\",\"DETECT_TIME\":\"2012/09/26 06:55:00\",\"ESTIMATE_TIME\":\"2012/09/26 12:55:00\",\"RESUME_TIME\":\"\",\"DIST_ID_LIST\":\"110100\",\"SCENE_DESC\":\"因自然流量大，进京方向温榆桥至五元桥拥堵，车辆行驶缓慢。\",\"PHOTO_PATH_LIST\":\"null\",\"NEI_DISID_LIST\":\"null\",\"BLOCK_REASON_ID\":\"151\",\"MEASURES_ID\":\"19\",\"DEAL_METHOD\":\"通过交通台、道路信息板、公众出行网发布拥堵信息\",\"BLCK_RSN_OTHR\":\"null\",\"MEASURES_OTHER\":\"通过交通台、道路信息板、公众出行网发布拥堵信息\",\"REPORT1_TIME\":\"2012/09/26 07:04:05\",\"REPORT2_TIME\":\"\",\"AUDIT1_TIME\":\"2012/09/26 07:04:40\",\"AUDIT2_TIME\":\"\",\"PUBLISH1_TIME\":\"2012/09/26 07:47:26\",\"PUBLISH2_TIME\":\"\",\"UNIT_NAME\":\"北京首都高速公路发展有限公司\",\"IS_MODIFIED\":\"0\",\"SEGMENT_NAME\":\"null\",\"ROAD_ID\":\"S12\",\"REPORT_USER_NAME\":\"刘雅芳\",\"BLOCK_REASON\":\"车流量大\",\"UNIT_ID\":\"6be724df-6585-4384-891d-cc9e4db44cbb\",\"MEASURES_NAME\":\"其它\",\"PROVINCE_ID\":\"11\",\"BLOCK_WAY\":\"1\",\"ROAD_NAME\":\"机场高速\",\"BLOCK_WAY_TYPE\":\"2\",\"BLOCK_TYPE\":\"1\",\"BRIDGE_OR_TUNNEL_ID\":\"null\",\"BLOCK_MILEAGE\":\"6000\",\"OPEN_DESC\":\"null\",\"Coordinate\":\"\",\"MESSAGE_ID\":\"8a8181d539fce14f0139ffd3f9b20115\",\"MESSAGE_TITLE\":\"S12线(机场高速)北京市温榆桥至五元桥段因车流量大通行受阻。\",\"MESSAGE_CONTENT\":\"    由于S12线(机场高速)北京市温榆桥至五元桥段(K7+00至K13+00)车流量大，该路段于2012年09月26日06时55分采取交通管制的措施，预计2012年09月26日12时55分恢复通行。请驾驶员注意沿途设立的绕行、禁行等警告、警示标志，小心驾驶。\",\"PUBLISH_USER\":\"路网值班\",\"PUBLISH_TIME\":\"2012/09/26 07:47:25\",\"ROAD_CODE\":\"S12\",\"BLOCK_SEGMENT\":\"null\",\"DISTRICT\":\"110100\",\"UNIT\":\"北京首都高速公路发展有限公司\",\"STOPREASON\":\"车流量大\",\"DEAL\":\"其它\"}}","{\"roadinfo\":{\"BLOCK_ID\":\"8a8181d539fce14f013a000e20530133\",\"REP_USER_PHONE\":\"0356-2231368   18603569197\",\"REPORT_USER_FAX\":\"null\",\"BLOCK_LOCATION\":\"丹河收费站\",\"START_STAKE\":\"10,70\",\"END_STAKE\":\"32,40\",\"DETECT_TIME\":\"2012/09/26 08:30:00\",\"ESTIMATE_TIME\":\"2012/09/26 09:30:00\",\"RESUME_TIME\":\"2012/09/26 09:20:00\",\"DIST_ID_LIST\":\"140500\",\"SCENE_DESC\":\"2012年9月26日8时30分，因河南交通事故，晋城至焦作方向在丹河收费站实行交通管制！ \",\"PHOTO_PATH_LIST\":\"null\",\"NEI_DISID_LIST\":\"null\",\"BLOCK_REASON_ID\":\"141\",\"MEASURES_ID\":\"402880af1f81ca03011f81d364ee0003\",\"DEAL_METHOD\":\"启动相应应急预案,领导赶赴现场指挥协调,并从二级路分流车辆,做好滞留车辆的劝返工作。\",\"BLCK_RSN_OTHR\":\"null\",\"MEASURES_OTHER\":\"null\",\"REPORT1_TIME\":\"2012/09/26 08:50:56\",\"REPORT2_TIME\":\"2012/09/26 09:30:20\",\"AUDIT1_TIME\":\"2012/09/26 09:22:29\",\"AUDIT2_TIME\":\"2012/09/26 09:47:09\",\"PUBLISH1_TIME\":\"2012/09/26 09:28:08\",\"PUBLISH2_TIME\":\"2012/09/26 10:34:28\",\"UNIT_NAME\":\"山西晋焦高速公路有限公司\",\"IS_MODIFIED\":\"0\",\"SEGMENT_NAME\":\"null\",\"ROAD_ID\":\"G5512\",\"REPORT_USER_NAME\":\"杨克轻\",\"BLOCK_REASON\":\"车辆交通事故\",\"UNIT_ID\":\"03624afe-0c27-4d79-ae19-265204f84520\",\"MEASURES_NAME\":\"单向封闭\",\"PROVINCE_ID\":\"14\",\"BLOCK_WAY\":\"1\",\"ROAD_NAME\":\"晋新高速\",\"BLOCK_WAY_TYPE\":\"1\",\"BLOCK_TYPE\":\"1\",\"BRIDGE_OR_TUNNEL_ID\":\"null\",\"BLOCK_MILEAGE\":\"21970\",\"OPEN_DESC\":\"null\",\"Coordinate\":\"\",\"MESSAGE_ID\":\"8a8181d539fce14f013a006cd5730174\",\"MESSAGE_TITLE\":\"G5512线(晋新高速)山西省晋城市丹河收费站恢复正常通行。\",\"MESSAGE_CONTENT\":\"    G5512线(晋新高速)山西省晋城市丹河收费站(K10+70至K32+40)已于2012年09月26日09时20分恢复正常通行，该路段曾因车辆交通事故于2012年09月26日08时30分通行受阻。\",\"PUBLISH_USER\":\"路网值班\",\"PUBLISH_TIME\":\"2012/09/26 10:34:23\",\"ROAD_CODE\":\"G5512\",\"BLOCK_SEGMENT\":\"null\",\"DISTRICT\":\"140500\",\"UNIT\":\"山西晋焦高速公路有限公司\",\"STOPREASON\":\"车辆交通事故\",\"DEAL\":\"单向封闭\"}}","{\"roadinfo\":{\"BLOCK_ID\":\"8a8181d539fce14f0139fd54baca0047\",\"REP_USER_PHONE\":\"0359-2533029\",\"REPORT_USER_FAX\":\"null\",\"BLOCK_LOCATION\":\"运城东、机场、运城北往太原方向入口封闭\",\"START_STAKE\":\"11,000\",\"END_STAKE\":\"80,400\",\"DETECT_TIME\":\"2012/09/25 20:00:00\",\"ESTIMATE_TIME\":\"2012/09/26 06:00:00\",\"RESUME_TIME\":\"2012/09/25 22:40:00\",\"DIST_ID_LIST\":\"140800\",\"SCENE_DESC\":\"K65+800 四辆小车追尾\",\"PHOTO_PATH_LIST\":\"null\",\"NEI_DISID_LIST\":\"null\",\"BLOCK_REASON_ID\":\"141\",\"MEASURES_ID\":\"14\",\"DEAL_METHOD\":\"路政人员正在处理现场\",\"BLCK_RSN_OTHR\":\"null\",\"MEASURES_OTHER\":\"null\",\"REPORT1_TIME\":\"2012/09/25 20:09:12\",\"REPORT2_TIME\":\"2012/09/25 22:48:41\",\"AUDIT1_TIME\":\"2012/09/25 20:09:52\",\"AUDIT2_TIME\":\"2012/09/25 22:49:19\",\"PUBLISH1_TIME\":\"2012/09/25 20:14:57\",\"PUBLISH2_TIME\":\"2012/09/25 23:14:32\",\"UNIT_NAME\":\"山西省运城高速公路有限责任公司\",\"IS_MODIFIED\":\"0\",\"SEGMENT_NAME\":\"null\",\"ROAD_ID\":\"S75\",\"REPORT_USER_NAME\":\"尹永军\",\"BLOCK_REASON\":\"车辆交通事故\",\"UNIT_ID\":\"7038c2bb-001c-4338-9c25-eeb5f5e3c957\",\"MEASURES_NAME\":\"封闭收费站出入口\",\"PROVINCE_ID\":\"14\",\"BLOCK_WAY\":\"1\",\"ROAD_NAME\":\"侯马-平陆高速公路\",\"BLOCK_WAY_TYPE\":\"2\",\"BLOCK_TYPE\":\"1\",\"BRIDGE_OR_TUNNEL_ID\":\"null\",\"BLOCK_MILEAGE\":\"69400\",\"OPEN_DESC\":\"null\",\"Coordinate\":\"21.32012313,110.250749|21.32000327,110.250893|21.31988342,110.25103537|21.31976356,110.25117919|21.31964371,110.25132301|21.31952385,110.25146684|21.319404,110.25161066|21.31928415,110.251755|21.3191643,110.251899|21.31904445,110.252043|21.31892459,110.252187|21.31880474,110.252331|21.31868489,110.252475|21.31856505,110.25261745|21.3184452,110.25276128|21.31832535,110.25290511|21.3182055,110.25304894|21.31808565,110.25319276|21.31796581,110.2533366|21.31784596,110.253481|21.31772611,110.253625|21.31761907,110.25375273|21.31750322,110.253901|21.31738738,110.25404742|21.31727153,110.25419476|21.31715569,110.254343|21.31703985,110.25448945|21.316924,110.2546368|21.31680816,110.254785|21.31669232,110.25493149|21.31661814,110.255027|21.31661814,110.255027|21.31650637,110.25517657|21.3163946,110.25532729|21.31628283,110.255479|21.31617106,110.25562874|21.3160593,110.25577946|21.31594753,110.255931|21.31583577,110.25608091|21.315724,110.256233|21.31561223,110.256383|21.31550047,110.25653308|21.31538871,110.256685|21.31527694,110.25683454|21.31516518,110.25698526|21.31508738,110.257091|21.31497971,110.257245|21.31487204,110.257399|21.31476437,110.257553|21.3146567,110.257707|21.31454903,110.257861|21.31444136,110.258015|21.31433369,110.258169|21.31422603,110.258323|21.31411836,110.258477|21.3140107,110.25862947|21.31390303,110.2587834|21.3138777,110.258821|21.31377451,110.25897684|21.31367132,110.259135|21.31356813,110.25929129|2...
	
		if(closedroadMarkers != null){
					closedroadMarkers.destroy();
				   // map.removeLayer(markers);
				}
				closedroadMarkers = new OpenLayers.Layer.Markers("closedroadMarkers");
			    map.addLayer(closedroadMarkers);

		       var roadList = data.closedroadInfo; //
		      
		      		       
		       var blockContent;
		       for(var index in roadList){
		    	   	blockContent = roadList[index];
					var blockHtml;
				  	var blockjson=eval("("+blockContent+")");//转换为json对象 
				  	addClosedRoadMarkerOD(blockjson.roadinfo);
		       }
		   }, "json");
}
function addClosedRoadMarker(closedroadjson) {
  	var points = [];
  	points = (closedroadjson.Coordinate).split("|"); //"x,y|x1,y1"
  	var blockTitle = closedroadjson.MESSAGE_TITLE;
  	var blockMsg = closedroadjson.MESSAGE_CONTENT;
  	var size = new OpenLayers.Size(38,29);
    var iconUrl = "static/images/alarm/0902.png";
    var icon = new OpenLayers.Icon(iconUrl,size,0);
    //{"roadinfo":{"BLOCK_ID":"8a8181d539d344350139d81f4bd0011b","REP_USER_PHONE":"13785998555","REPORT_USER_FAX":"null","BLOCK_LOCATION":"玉田站附近","START_STAKE":"112,000","END_STAKE":"113,000","DETECT_TIME":"2012/09/18 14:40:00","ESTIMATE_TIME":"2012/09/18 23:00:00","RESUME_TIME":"","DIST_ID_LIST":"130200","SCENE_DESC":"京秦高速北京方向K112施工路段车流量较大，车辆缓慢通行约1公里。","PHOTO_PATH_LIST":"null","NEI_DISID_LIST":"null","BLOCK_REASON_ID":"211","MEASURES_ID":"19","DEAL_METHOD":"情报板提示、语音提示","BLCK_RSN_OTHR":"null","MEASURES_OTHER":"情报板提示","REPORT1_TIME":"2012/09/18 14:44:53","REPORT2_TIME":"","AUDIT1_TIME":"2012/09/18 14:46:49","AUDIT2_TIME":"","PUBLISH1_TIME":"2012/09/18 17:47:07","PUBLISH2_TIME":"","UNIT_NAME":"河北省高速公路京秦管理处","IS_MODIFIED":"0","SEGMENT_NAME":"null","ROAD_ID":"G1","REPORT_USER_NAME":"周迎新","BLOCK_REASON":"公路施工养护","UNIT_ID":"1ee7db26-52fa-4f12-9727-d41a26f3e09f","MEASURES_NAME":"其它","PROVINCE_ID":"13","BLOCK_WAY":"1","ROAD_NAME":"京哈高速","BLOCK_WAY_TYPE":"2","BLOCK_TYPE":"1","BRIDGE_OR_TUNNEL_ID":"null","BLOCK_MILEAGE":"1000","OPEN_DESC":"null","Coordinate":"39.74896158,117.69845802|39.74903498,117.69867472|39.74910838,117.69889142|39.74918178,117.69910812|39.74925518,117.69932482|39.74932858,117.69954152|39.74940198,117.69975822|39.74947538,117.69997492|39.74954878,117.70019162|39.74962217,117.70040831|39.74969556,117.70062501|39.74976896,117.7008417|39.74984235,117.7010584|39.74991574,117.70127509|39.74998913,117.70149179|39.75006252,117.70170848|39.7501359,117.70192517|39.75019897,117.7021114|39.75026944,117.70232982|39.7503399,117.70254825|39.75041037,117.70276667|39.75048083,117.70298509|39.75055129,117.70320351|39.75062175,117.70342193|39.75069221,117.70364035|39.75076267,117.70385877|39.75083313,117.70407718|39.75090358,117.7042956|39.75097403,117.70451402|39.75104449,117.70473243|39.75111494,117.70495084|39.75118539,117.70516926|39.75125584,117.70538767|39.75132629,117.70560608|39.75139673,117.70582449|39.75146718,117.7060429|39.75153762,117.70626131|39.75160806,117.70647972|39.7516785,117.70669812|39.75174894,117.70691653|39.75181938,117.70713493|39.75188982,117.70735334|39.75196025,117.70757174|39.75203069,117.70779014|39.75210112,117.70800854|39.75217155,117.70822694|39.75224198,117.70844534|39.75224459,117.70845343|39.75231693,117.7086707|39.75238927,117.70888798|39.75246161,117.70910525","MESSAGE_ID":"8a8181d539d839290139d840f6a50004","MESSAGE_TITLE":"G1线(京哈高速)河北省唐山市玉田站因公路施工养护通行受阻。","MESSAGE_CONTENT":"由于G1线(京哈高速)河北省唐山市玉田站(K112+000至K113+000)进行公路施工养护，该路段于2012年09月18日14时40分采取交通管制的措施，预计2012年09月18日18时恢复通行。请驾驶员注意沿途设立的绕行、禁行等警告、警示标志，小心驾驶。","PUBLISH_USER":"路网值班","PUBLISH_TIME":"2012/09/18 15:21:39","ROAD_CODE":"G1","BLOCK_SEGMENT":"null","DISTRICT":"130200","UNIT":"河北省高速公路京秦管理处","STOPREASON":"公路施工养护","DEAL":"其它"}}
  	for(var ipt in points){
    //if (points.length=0) return;
  	//for (var i=0;i<1;i++){
  		var lonlatStrArr = points[ipt].split(","); 
  		var lonlat = WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(lonlatStrArr[0],lonlatStrArr[1]));
	    marker = new OpenLayers.Marker(lonlat,icon);
	    marker.events.register('click',this,function(evt){
		   if (popup != null) {
			   map.removePopup(popup);
		   }
		  	var result ="<div>"; 
	        result +="<font size='3px'><b>"+closedroadjson.ROAD_NAME+"</font><br/>";
	        result +="<font size='2px'>"+blockTitle+"</font><br/>";
	        result +="<font size='2px'>"+blockMsg+"</font><br/>";
	        result +="<div style='overflow: auto;width:280px;'><font size='2px'>"+blockMsg+"</font></div>";
	        result +="</div>";
		      popup = new OpenLayers.Popup.FramedCloud("featurePopup",
		    		  lonlat,
	                  new OpenLayers.Size(300, 250),
	                  result,
	                  null, true);m
	        popup.setBackgroundColor("#B4CA63");
	        closedroadMarkers.map.addPopup(popup);
		    OpenLayers.Event.stop(evt);
	    });
  	}
  	closedroadMarkers.addMarker(marker);
}

function getCRoadIco(closeReason)
{
	var iconUrl="static/images/closedRoad/qblk.gif";
		
	switch(closeReason){
	
	case '道路已畅通': 
		iconUrl = "static/images/closedRoad/ok.gif";
		break;
	case '恶劣气候': 
		iconUrl = "static/images/closedRoad/elqh.gif";
		break;
	case '非灾害性': 
		iconUrl = "static/images/closedRoad/fzhx.gif";
		break;
	case '其他（突发性）': 
		iconUrl = "static/images/closedRoad/qtftfx.gif";
		break;
	case '全部路况': 
		iconUrl = "static/images/closedRoad/qblk.gif";
		break;
	case '施工养护': 
		iconUrl = "static/images/closedRoad/sgyh.gif";
		break;
	case '事故灾害': 
		iconUrl = "static/images/closedRoad/sgzh.gif";
		break;
	case '重大社会活动': 
		iconUrl = "static/images/closedRoad/zdshhd.gif";
		break;
	case '自然灾害': 
		iconUrl = "static/images/closedRoad/zrzh.gif";
		break;
	}
	return iconUrl;
}
function addClosedRoadMarkerOD(closedroadjson) {
	 
  	var points = [];
  	points = (closedroadjson.Coordinate).split("|"); //"x,y|x1,y1"
  	//alert(points);
  	if (points.length==0) {return;}
  	var blockTitle = closedroadjson.MESSAGE_TITLE;
  	var blockMsg = closedroadjson.MESSAGE_CONTENT;
  	var size = new OpenLayers.Size(17,22);
  	
    var iconUrl = getCRoadIco(closedroadjson.STOPREASON);
    var icon = new OpenLayers.Icon(iconUrl,size,0);
    //{"roadinfo":{"BLOCK_ID":"8a8181d539d344350139d81f4bd0011b","REP_USER_PHONE":"13785998555","REPORT_USER_FAX":"null","BLOCK_LOCATION":"玉田站附近","START_STAKE":"112,000","END_STAKE":"113,000","DETECT_TIME":"2012/09/18 14:40:00","ESTIMATE_TIME":"2012/09/18 23:00:00","RESUME_TIME":"","DIST_ID_LIST":"130200","SCENE_DESC":"京秦高速北京方向K112施工路段车流量较大，车辆缓慢通行约1公里。","PHOTO_PATH_LIST":"null","NEI_DISID_LIST":"null","BLOCK_REASON_ID":"211","MEASURES_ID":"19","DEAL_METHOD":"情报板提示、语音提示","BLCK_RSN_OTHR":"null","MEASURES_OTHER":"情报板提示","REPORT1_TIME":"2012/09/18 14:44:53","REPORT2_TIME":"","AUDIT1_TIME":"2012/09/18 14:46:49","AUDIT2_TIME":"","PUBLISH1_TIME":"2012/09/18 17:47:07","PUBLISH2_TIME":"","UNIT_NAME":"河北省高速公路京秦管理处","IS_MODIFIED":"0","SEGMENT_NAME":"null","ROAD_ID":"G1","REPORT_USER_NAME":"周迎新","BLOCK_REASON":"公路施工养护","UNIT_ID":"1ee7db26-52fa-4f12-9727-d41a26f3e09f","MEASURES_NAME":"其它","PROVINCE_ID":"13","BLOCK_WAY":"1","ROAD_NAME":"京哈高速","BLOCK_WAY_TYPE":"2","BLOCK_TYPE":"1","BRIDGE_OR_TUNNEL_ID":"null","BLOCK_MILEAGE":"1000","OPEN_DESC":"null","Coordinate":"39.74896158,117.69845802|39.74903498,117.69867472|39.74910838,117.69889142|39.74918178,117.69910812|39.74925518,117.69932482|39.74932858,117.69954152|39.74940198,117.69975822|39.74947538,117.69997492|39.74954878,117.70019162|39.74962217,117.70040831|39.74969556,117.70062501|39.74976896,117.7008417|39.74984235,117.7010584|39.74991574,117.70127509|39.74998913,117.70149179|39.75006252,117.70170848|39.7501359,117.70192517|39.75019897,117.7021114|39.75026944,117.70232982|39.7503399,117.70254825|39.75041037,117.70276667|39.75048083,117.70298509|39.75055129,117.70320351|39.75062175,117.70342193|39.75069221,117.70364035|39.75076267,117.70385877|39.75083313,117.70407718|39.75090358,117.7042956|39.75097403,117.70451402|39.75104449,117.70473243|39.75111494,117.70495084|39.75118539,117.70516926|39.75125584,117.70538767|39.75132629,117.70560608|39.75139673,117.70582449|39.75146718,117.7060429|39.75153762,117.70626131|39.75160806,117.70647972|39.7516785,117.70669812|39.75174894,117.70691653|39.75181938,117.70713493|39.75188982,117.70735334|39.75196025,117.70757174|39.75203069,117.70779014|39.75210112,117.70800854|39.75217155,117.70822694|39.75224198,117.70844534|39.75224459,117.70845343|39.75231693,117.7086707|39.75238927,117.70888798|39.75246161,117.70910525","MESSAGE_ID":"8a8181d539d839290139d840f6a50004","MESSAGE_TITLE":"G1线(京哈高速)河北省唐山市玉田站因公路施工养护通行受阻。","MESSAGE_CONTENT":"由于G1线(京哈高速)河北省唐山市玉田站(K112+000至K113+000)进行公路施工养护，该路段于2012年09月18日14时40分采取交通管制的措施，预计2012年09月18日18时恢复通行。请驾驶员注意沿途设立的绕行、禁行等警告、警示标志，小心驾驶。","PUBLISH_USER":"路网值班","PUBLISH_TIME":"2012/09/18 15:21:39","ROAD_CODE":"G1","BLOCK_SEGMENT":"null","DISTRICT":"130200","UNIT":"河北省高速公路京秦管理处","STOPREASON":"公路施工养护","DEAL":"其它"}}
  	//for(var ipt in points){
    //if (points.length=0) return;
  	//for (var i=0;i<1;i++){
  		var lonlatStrArr = points[0].split(","); 
  		var lonlat;
  		if (lonlatStrArr[1] > 60)
  			{
  			lonlat= WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(lonlatStrArr[1],lonlatStrArr[0]));
  			}
  		else
  			{
  				lonlat= WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(lonlatStrArr[0],lonlatStrArr[1]));
  			}
  		
	    marker = new OpenLayers.Marker(lonlat,icon);
	    marker.events.register('click',this,function(evt){
		   if (popup != null) {
			   map.removePopup(popup);
		   }
		   var result ="<div class='feis'>"; 
		  	result += "<h1>"+closedroadjson.ROAD_NAME+"</h1>";
		  	result += "<p><span>发布时间：</span> "+closedroadjson.PUBLISH1_TIME+"</p>"; 
		  	result += "<p><span>路线编号：</span> "+closedroadjson.ROAD_ID+" </p>";
		  	result += "<p><span>受阻路段：</span> "+ closedroadjson.BLOCK_LOCATION +"</p>";
		  	result += "<p><span>阻断时间：</span> "+ closedroadjson.DETECT_TIME +"</p>";
		  	result +="<p><span>预计恢复时间：</span>"+ closedroadjson.ESTIMATE_TIME +"</p>";
		  	result += "<p><span>通行提示："+ closedroadjson.SCENE_DESC +"</span> </p>";			
	        result +="</div>";
		      popup = new OpenLayers.Popup.FramedCloud("featurePopup",
		    		  lonlat,
	                  new OpenLayers.Size(300, 250),
	                  result,
	                  null, true);
	        popup.setBackgroundColor("#B4CA63");
	        closedroadMarkers.map.addPopup(popup);
		    OpenLayers.Event.stop(evt);
	    });
	    closedroadMarkers.addMarker(marker);
	    
	    /*lonlatStrArr = points[points.length-1].split(","); 
	    if (lonlatStrArr[1] > 60)
			{
			lonlat= WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(lonlatStrArr[1],lonlatStrArr[0]));
			}
		else
			{
				lonlat= WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(lonlatStrArr[0],lonlatStrArr[1]));
			}
	    marker = new OpenLayers.Marker(lonlat,icon);
	    marker.events.register('click',this,function(evt){
		   if (popup != null) {
			   map.removePopup(popup);
		   }
		  	var result ="<div>"; 
	        result +="<font size='3px'><b>"+closedroadjson.ROAD_NAME+"</font><br/>";
	        result +="<font size='2px'>"+blockTitle+"</font><br/>";
	        result +="<font size='2px'>"+blockMsg+"</font><br/>";
	        result +="<div style='overflow: auto;width:280px;'><font size='2px'>"+blockMsg+"</font></div>";
	        result +="</div>";
		      popup = new OpenLayers.Popup.FramedCloud("featurePopup",
		    		  lonlat,
	                  new OpenLayers.Size(300, 250),
	                  result,
	                  null, true);
	        popup.setBackgroundColor("#B4CA63");
	        closedroadMarkers.map.addPopup(popup);
		    OpenLayers.Event.stop(evt);
	    });
  	//}
	    closedroadMarkers.addMarker(marker);*/
}

function redrawLayer(){
	alarmInfo();
	closedroadInfo();
}
//window.setInterval(redrawLayer, 6000);

// 显示右侧页面
function showSide(btnType) { 
	var isMapInfoDisplay = $("#MapInfo").css("display") == "none";
	if(isMapInfoDisplay) {
	    $("#MapInfo").css("display", 'block');
	    $("#superwaybuttonsDiv").css("right", 200);
		$("#alarmbuttonsDiv").css("right", 200);
		$("#nationRoadbuttonsDiv").css("right", 200);
		//if(btnType=="superway") {
			$("#superwayDiv").css("display","block");
			//$("#closeSide").css("display","none");
		//}
		$("#contents").css("display","block");
	    return;
	}
//	$("#MapInfo").css("display", 'none');
//	$("#superwaybuttonsDiv").css("right", 0);
//	$("#alarmbuttonsDiv").css("right", 0);
	
}

// 选择高速公路时触发
function selectSuperWay(superWayNameAndIndex) {
	var array = superWayNameAndIndex.split(",");
	// 隐藏默认字
    $("#keywordName").siblings("span").hide();
	document.getElementById("keywordName").value=array[0];
	document.getElementById("keywordIndex").value=array[1];
}

// 搜索高速公路
function searchSuperWay(superWayIndex){
	var index= document.getElementById("keywordIndex");
	querySuperway(index);
}

function closeSide() {
	$("#MapInfo").css("display","none");

	$("#superwayDiv").css("display","none");
	$("#closeSide").css("display","none");
	$("#alarmcontentDiv").css("display","none");
	$("#contents").css("display","none");
	
	$("#superwaybuttonsDiv").css("right", 0);
	$("#alarmbuttonsDiv").css("right", 0);
	$("#airportbuttonsDiv").css("right", 0);
	$("#nationRoadbuttonsDiv").css("right", 0);
	$("#radarbuttonsDiv").css("right", 0);
}


//===================================airport============================================================
var airportDataUnderCurrentZoom=null;
var airportDataOvertopCurrentZoom=null;
function airportInfo(zoom){
	if(airportMarkers != null) {
		airportMarkers.destroy();
	}
	airportMarkers = new OpenLayers.Layer.Markers("airportMarkers");
    map.addLayer(airportMarkers);
//	if(airTextLayer != null) {
//		airTextLayer.destroy();
//	}
	var style = new OpenLayers.Style({
	    fillColor: "#ffcc66",
	    strokeColor: "#ff9933",
	    strokeWidth: 2,
	    label: "${NAME}",
	    fontColor: "#333333",
	    fontFamily: "sans-serif",
	    fontWeight: "bold"
	}, {
	    rules: [
	        new OpenLayers.Rule({
	            symbolizer: {
	                pointRadius: 37,
	                fontSize: "9px"
	            }
	        })
	    ]
	});
//	airTextLayer = new OpenLayers.Layer.Vector("机场文字图层", {
//	    styleMap: new OpenLayers.StyleMap(style)
//	});
//    map.addLayer(airTextLayer);
//    features = null;
//    features = [];
    
	if(zoom < currentZoom) {
		if(airportDataUnderCurrentZoom == null || airportDataUnderCurrentZoom == ""){
			queryAirportInfo(zoom);
		}else{
			getAirportInfoFromMem(zoom);
		} 
	} else {    
		if(airportDataOvertopCurrentZoom == null || airportDataOvertopCurrentZoom == ""){
			queryAirportInfo(zoom);
		}else{
			getAirportInfoFromMem(zoom);
		}	
	}
}

function queryAirportInfo(zoom){ //后台查询
		$.post("/airport", { Action: "post", zoom:map.zoom},
		  function (data, textStatus){
			// 缩放级小于currentZoom时缓存数据
			if(map.zoom < currentZoom) {
			    airportDataUnderCurrentZoom = data;
			} else {    // 缩放级大于3时缓存数据
				airportDataOvertopCurrentZoom = data;
			}
		
			if(nationRoadMarkers != null) {
				nationRoadMarkers.destroy();
			}
			if(stationMarkers != null) {
				stationMarkers.destroy();//收费站图层
			}
			if(closedroadMarkers != null) {
				closedroadMarkers.destroy();	//封路信息图层
			}
			if(markers != null) {
				markers.destroy();	
			}

		    airportData = data;
		    for(var index in airportData){
	            for(var index2 in airportData[index]) {
	            	if((airportData[index][index2]).hasOwnProperty('NAME'))
	            		addAirportMarker(airportData[index][index2]);
	            	else
	            		addAirportMarker(airportData[index]);
	            }
		    }
			$("#tuli").css("background","#5498DF");
			$("#road").css("background","#5498DF");
			$("#air").css("background","#0145a1");
			$("#superway").css("background","#5498DF");
			$("#radar").css("background","#5498DF");
			
			$("#superwaybuttonsDiv").css("right", 0);
			$("#alarmbuttonsDiv").css("right", 0);
			$("#airportbuttonsDiv").css("right", 0);
			$("#radarbuttonsDiv").css("right", 0);
			
			$("#superwaycontentDiv").html("");
			// 右侧栏显示
//			$('#side').css({"display":"none"});
//			$('#guanbi').css({"display":"block"});
//			$('#sh').css({"display":"block"});
			closeSide();
			
			//$("#MapInfo").css("display","block");
			/*$("#superwayDiv").css("display","block");
			$("#contents").css("display","block");*/
			$('#alarmcontentDiv').css({"display":"none"});
			
			$("#superwaybuttonsDiv").css("right", 0);
			$("#alarmbuttonsDiv").css("right", 0);
			$("#airportbuttonsDiv").css("right", 0);
			$("#nationRoadbuttonsDiv").css("right", 0);
			$("#radarbuttonsDiv").css("right", 0);
			$('#superwaycontentDiv').css("display","block");
		}, "json");
}
function getAirportInfoFromMem(zoom){ //前台缓存
	var airdataJson;
	// 缩放级小于currentZoom时缓存数据
	if(map.zoom < currentZoom) {
		airdataJson = airportDataUnderCurrentZoom;
	} else {    // 缩放级大于currentZoom时缓存数据
		airdataJson = airportDataOvertopCurrentZoom;
	}
	
	if(nationRoadMarkers != null) {
		nationRoadMarkers.destroy();
	}
	if(stationMarkers != null) {
		stationMarkers.destroy();//收费站图层
	}
	if(closedroadMarkers != null) {
		closedroadMarkers.destroy()	//封路信息图层
	}
	if(markers != null) {
		markers.destroy()	
	}
	
    airportData = airdataJson;
    for(var index in airportData){
        for(var index2 in airportData[index]) {
        	if((airportData[index][index2]).hasOwnProperty('NAME'))
        		addAirportMarker(airportData[index][index2]);
        	else
        		addAirportMarker(airportData[index]);
        }
    }
	$("#tuli").css("background","#5498DF");
	$("#road").css("background","#5498DF");
	$("#air").css("background","#0145a1");
	$("#superway").css("background","#5498DF");
	$("#radar").css("background","#5498DF");
	
	$("#superwaybuttonsDiv").css("right", 0);
	$("#alarmbuttonsDiv").css("right", 0);
	$("#airportbuttonsDiv").css("right", 0);
	$("#radarbuttonsDiv").css("right", 0);
	
	$("#superwaycontentDiv").html("");
	// 右侧栏显示
//	$('#side').css({"display":"none"});
//	$('#guanbi').css({"display":"block"});
//	$('#sh').css({"display":"block"});
	closeSide();
	
	//$("#MapInfo").css("display","block");
	/*$("#superwayDiv").css("display","block");
	$("#contents").css("display","block");*/
	$('#alarmcontentDiv').css({"display":"none"});
	
	$("#superwaybuttonsDiv").css("right", 0);
	$("#alarmbuttonsDiv").css("right", 0);
	$("#airportbuttonsDiv").css("right", 0);
	$("#nationRoadbuttonsDiv").css("right", 0);
	$("#radarbuttonsDiv").css("right", 0);
	$('#superwaycontentDiv').css("display","block");
}

var selectAirportMarker = null;
function addAirportMarker(airportObj) {
  	var size = new OpenLayers.Size(30,30);
  	var iconUrl="/static/images/icons/air3.png"; 
    var icon = new OpenLayers.Icon(iconUrl,size,0);
	var lonlat= WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(airportObj["POINT_X"],airportObj["POINT_Y"]));
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    var marker = new OpenLayers.Marker(lonlat,icon,offset);
    
    
    marker.events.register("mousemove",this,function(evt) {
    	if (evt.srcElement != selectAirportMarker) {
            evt.srcElement.src = "/static/images/icons/air2.png";
    	}
       
        if(promptPopup != null) {
        	 map.removePopup(promptPopup);
        }
        html="<div style='padding:8px;'  align='center'><front style='size:40px'>" + airportObj['NAME'] + "</front></div>"
        promptPopup = new OpenLayers.Popup("featurePopup",
	    		lonlat,
                new OpenLayers.Size(150, 30),
                html,
                null, true);
        promptPopup.setBackgroundColor("#96caff");
        airportMarkers.map.addPopup(promptPopup);
    });
    marker.events.register("mouseout",this,function(evt) {
	 
	    if(promptPopup != null) {
       	    map.removePopup(promptPopup);
        }
        if (evt.srcElement != selectAirportMarker){
    	    evt.srcElement.src = "/static/images/icons/air3.png";
    	}
   
    });

    
    marker.events.register('click',this,function(evt){
    	if (popup != null) {
			 map.removePopup(popup);
		}
    	if(promptPopup != null) {
         	 map.removePopup(promptPopup);
        }
        if(airportMarkers == null) {
        	airportMarkers = new OpenLayers.Layer.Markers("airportMarkers");
        }
        
        //evt.srcElement.src = "/static/images/icons/air2.png";
        
	    var marker = new OpenLayers.Marker(lonlat,icon);
	   
	   selectAirportMarker = evt.srcElement;
	   selectAirportMarker.src = "/static/images/icons/air3.png";
	   $.post("/airportinfo", { Action: "post", areaId:airportObj["AreaID"]},
			   function (data, textStatus){
		   			ybList = [];
		   			var skHtml;
		   			var skContent = data.skContent;
		   			var skjson;
		   			var ybContent = data.ybContent;
		   			
				  	var ybjson=eval("("+ybContent+")");//转换为json对象 
				  	var ybObj = ybjson.weatherinfo;
			        
				  	
		   			try{
		   			 	skjson=eval("("+skContent+")");//转换为json对象 
					  	var skObj = skjson.sk_info;
					  	//var skHtml = "<div class='fei'>";
					  	//"+skObj.date+"
					  	var temprature = (skObj.temp).indexOf("9999")==-1?skObj.temp+"℃":'暂无';
					  	var shidu = (skObj.sd).indexOf("9999")==-1?skObj.sd:'暂无';
					  	var jiangshui="";
					  	if((typeof(skObj.js) != "undefined") && (skObj.js).indexOf("9999")==-1 && skObj.js !=''){
					  		jiangshui =skObj.js+"mm";
					  	}
					  	else
					  	{
					  		jiangshui="暂无";
					  	}
	
					  	skHtml ="<div class='fei'><h1><a alt="+airportObj["NAME"]+">"+airportObj["NAME"]+"</a></h1>";
					  	skHtml +="<ul><li class='wei'>当前实况</li><li>温度："+temprature+"</li><li>风："+skObj.wd+"&nbsp;"+skObj.ws+"级</li><li>湿度："+shidu+"</li><li>降水："+jiangshui+"</li></ul>";

		   			}catch(err){
		   				skHtml = "<div class='fei'>";
					    skHtml +="<h1>"+airportObj["NAME"]+"暂无实况</h1>";
					    skHtml +="<ul><li class='wei'>当前实况</li><li>温度：</li><li>风：</li><li>湿度：</li></ul>";
		   			}	
				  	
				  	ybList = ybObj; //获取预报列表
		   			var weather1=ybObj.weather1;
		   			var fl1=ybObj.fl1;
		   			var fchh=ybObj.fchh;
		   			var wind1=ybObj.wind1;
		   			var cityid=ybObj.cityid;
		   			var img1="";
		   			var img2="";
		   			if(fchh=="18")
		   			{
		   				if(ybObj.img1.length=="1")
		   				{	
		   					img1="n0"+ybObj.img1;
							if(ybObj.img2=="99")
							{
								img2="d0"+ybObj.img1;
							}
							else
							{
								if(ybObj.img2.length=="1")
								{
									img2="d0"+ybObj.img2;
								}
								else
								{
									img2="d"+ybObj.img2;
								}
							}
		   				}
		   				else
		   				{
		   				    img1="n"+ybObj.img1;
							if(ybObj.img2=="99")
							{
								img2="d"+ybObj.img1;
							}
							else
							{
								if(ybObj.img2.length=="1")
								{
									img2="d0"+ybObj.img2;
								}
								else
								{
									img2="d"+ybObj.img2;
								}
							}
		   				   
		   				}	
		
		   			}
		   			else
		   			{
		   				if(ybObj.img1.length=="1")
		   				{	
		   					img1="d0"+ybObj.img1;
							if(ybObj.img2=="99")
							{
								img2="n0"+ybObj.img1;
							}
							else
							{
								if(ybObj.img2.length=="1")
								{
									img2="n0"+ybObj.img2;
								}
								else
								{
									img2="n"+ybObj.img2;
								}
							}
		   				}
		   				else
		   				{
		   				    img1="d"+ybObj.img1;
							if(ybObj.img2=="99")
							{
								img2="n"+ybObj.img1;
							}
							else
							{
								if(ybObj.img2.length=="1")
								{
									img2="n0"+ybObj.img2;
								}
								else
								{
									img2="n"+ybObj.img2;
								}
							}
		   				   
		   				}	
		   			}
		   			
		   			var date_y=ybObj.date_y.substr(7,3);
		   			var img_title1=ybObj.img_title1;
		   			var img_title2=ybObj.img_title2;
		   			var temp1=ybObj.temp1;
		   			var city=ybObj.city;
		   			
		   	       var ybHtml="<ul class='line'>";
		   	       ybHtml +="<li class='wei'><span>"+date_y+fchh+"时发布</span>"+airportObj["NAME"]+"天气预报</li>";
		   	       ybHtml +="<li><span><img src='http://www.weather.com.cn/m/i/icon_weather/42x30/"+img1+".gif' alt='"+img_title1+"'/></span>"+weather1+"</li>";
		   	       ybHtml +="<li><span><img src='http://www.weather.com.cn/m/i/icon_weather/42x30/"+img2+".gif' alt='"+img_title2+"'/></span>"+temp1+"</li>";
		   	       ybHtml +="<li>"+wind1+"</li>";
		   	       ybHtml +="</ul><p><span><a href='http://www.weather.com.cn/weather/"+cityid+".shtml' target='_blank'>查看详情>></a></span></p></div>";
				  	
				
				  	var result =skHtml+ybHtml;
				  	
			        popup = new OpenLayers.Popup.FramedCloud("featurePopup",
			    		  lonlat,
		                  new OpenLayers.Size(350, 350),
		                  result,
		                  null, true);
			        popup.setBackgroundColor("#B4CA63");
			        airportMarkers.map.addPopup(popup);
												
			   }, "json");
	   OpenLayers.Event.stop(evt);
    }); 

    try{
    	airportMarkers.addMarker(marker);
    }catch(e){
    	//alert(airportObj["NAME"]+"异常");
    }
    
	
//	map.addLayer(airportMarkers);
//	var stationsExtent=airportMarkers.getDataExtent();
//	map.zoomToExtent(stationsExtent,false);
}


//============================nationRoad========================================

function nationRoadInfo() {
	$("#keywordName").val("");
	var nationRoadCodeHtml="<ul class='liebiao'>";
	var roadCodeArr = roadCodeList.data;
	for(index in roadCodeArr){
		var nationRoadjson=roadCodeArr[index];//转换为json对象 
		for(g in nationRoadjson){
			nationRoadCodeHtml += "<li style='list-style-type:square;width:80px;' id='gd"+nationRoadjson[g]+"'><a  href='#' onclick=queryNationRoad('"+nationRoadjson[g]+"')>"+nationRoadjson[g]+"</a></li>";
		}
	}
	
	$("#tuli").css("background","#5498DF");
	$("#road").css("background","#0145a1");
	$("#air").css("background","#5498DF");
	$("#superway").css("background","#5498DF");
	$("#radar").css("background","#5498DF");
	
	// 右侧栏显示
	$('#side').css({"display":"block"});
	$('#guanbi').css({"display":"block"});
	$('#sh').css({"display":"block"});
	
	$("#MapInfo").css("display","block");
	$("#superwayDiv").css("display","block");
	
	$("#contents").css("display","none");
	$('#alarmcontentDiv').css("display","none");
	$('#alarmImg').css("display","none");
	$('#superwaycontentDiv').css("display","block");
	
	$("#superwaybuttonsDiv").css("right", 150);
	$("#alarmbuttonsDiv").css("right", 150);
	$("#airportbuttonsDiv").css("right", 150);
	$("#nationRoadbuttonsDiv").css("right", 150);
	$("#radarbuttonsDiv").css("right", 150);
	nationRoadCodeHtml +="</ul>"
	$('#superwaycontentDiv').html(nationRoadCodeHtml);

}

var selectNationRoadMarker = null;
var selectGD;
function queryNationRoad(roadCode) {
    $("#keywordName").siblings("span").hide();
	$("#keywordName").val(roadCode);
	$("#keywordIndex").val(roadCode);
    if(airportMarkers != null) {
    	airportMarkers.destroy();
    }

	if(stationMarkers != null) {
		stationMarkers.destroy();//收费站图层
	}
	if(closedroadMarkers != null) {
		closedroadMarkers.destroy()	//封路信息图层
	}
	if(markers != null) {
		markers.destroy()	
	}
	
	if (selectGD!="")
	{
		$('#gd'+selectGD).find("a").css({"font-weight":"normal", "color":"#3366BB"});
	}
	$('#gd'+roadCode).find("a").css({"font-weight":"bold","color":"red"});
	selectGD=roadCode;
	
	
	$.ajax({type: 'POST', url: "/nationRoad",data: {roadCode: roadCode},
		  success: function(data, textStatus){
				if(nationRoadMarkers != null){
					nationRoadMarkers.destroy();
				   // map.removeLayer(markers);
				}
				nationRoadMarkers = new OpenLayers.Layer.Markers("nationRoadMarkers");
			    map.addLayer(nationRoadMarkers);
				for(index in data){
					addNationalRMark(data[index]);
				}
				var stationsExtent=nationRoadMarkers.getDataExtent();
				map.zoomToExtent(stationsExtent,false);
		  },
		  dataType: "json"
		});
}

function addNationalRMark(roadObj){
	
	var size = new OpenLayers.Size(30,50);
  	var iconUrl="/static/images/icons/road.png"; 
    var icon = new OpenLayers.Icon(iconUrl,size,0);
    if(nationRoadMarkers == null) {
    	nationRoadMarkers = new OpenLayers.Layer.Markers("nationRoadMarkers");
    }

    
	var roadLonLat = WebtAPI.WUtil._toMerc(new OpenLayers.LonLat(roadObj["POINT_X"],roadObj["POINT_Y"]));
    var marker = new OpenLayers.Marker(roadLonLat,icon);
    
    marker.events.register("mousemove",this,function(evt){
		if (evt.srcElement != selectNationRoadMarker) {
				evt.srcElement.src = "/static/images/icons/road2.png";
		}
    });
    marker.events.register("mouseout",this,function(evt) {
		if (evt.srcElement != selectNationRoadMarker){
			evt.srcElement.alt="";
			evt.srcElement.src = "/static/images/icons/road.png";
		}
   });
    
    marker.events.register('click',this,function(evt){
	    if (popup != null) {
		   map.removePopup(popup);
	    }
        
	    // 暂时有的国道stationId相对应，所以会做一个判断
	    var stationId = (typeof(roadObj["stationid"]) == "undefined") ? "" : roadObj["stationid"];
	    //var stationId = roadObj["stationid"]
	    $.post("/roadsegment", { Action: "post", areaId:roadObj["AreaID"],stationId:stationId},
				   function (data, textStatus){				     
			   			ybList = [];
			   			var skHtml;
			   			var skContent = data.skContent;
			   			var skjson;
			   			var ybContent = data.ybContent;
			   			
					  	var ybjson=eval("("+ybContent+")");//转换为json对象 
					  	var ybObj = ybjson.weatherinfo;
					    
					  	// 雷达
					  	var radarContent = data.radarContent;
					  	var radarObj = eval("("+radarContent+")");
			   			try{
						  	skjson=eval("("+skContent+")");//转换为json对象 
						  	var skObj = skjson.sk_info;
						  	//var skHtml = "<div class='fei'>";
						  	//"+skObj.date+"
						  	var temprature = (skObj.temp).indexOf("9999")==-1?skObj.temp+"℃":'暂无';
						  	var shidu = (skObj.sd).indexOf("9999")==-1?skObj.sd:'暂无';
						  	var jiangshui="";
						  	
						  	if((typeof(skObj.js) != "undefined") && (skObj.js).indexOf("9999")==-1 && skObj.js !=''){
						  		jiangshui =skObj.js+"mm";
						  	}
						  	else
						  	{
						  		jiangshui="暂无";
						  	}
						  	var cityName="";
						  	if(skObj.cityName.length>12)
						  	{
						  		cityName=skObj.cityName.substring(0,12)+"...";
						  	}
						  	else
						  	{
						  		cityName=skObj.cityName;
						  	}
						  	skHtml ="<div class='fei'><h1><a alt="+roadObj.LUDUAN+">"+roadObj.LUDUAN+"</a></h1>";
						  	skHtml +="<ul><li class='wei'>当前实况</li><li>温度："+temprature+"</li><li>风："+skObj.wd+"&nbsp;"+skObj.ws+"级</li><li>湿度："+shidu+"</li><li>降水："+jiangshui+"</li></ul>";

			   			}catch(err){
			   				skHtml = "<div class='fei'>";
						    skHtml +="<h1>"+roadObj.LUDUAN+"暂无实况信息</h1>";
						    skHtml +="<ul><li class='wei'>当前实况</li><li>温度：</li><li>风：</li><li>湿度：</li></ul>";
			   			}	
					  	
					  	ybList = ybObj; //获取预报列表
			   			var weather1=ybObj.weather1;
			   			var fl1=ybObj.fl1;
			   			var fchh=ybObj.fchh;
			   			var wind1=ybObj.wind1;
			   			var cityid=ybObj.cityid;
			   			var img1="";
			   			var img2="";
			   			if(fchh=="18")
			   			{
			   				if(ybObj.img1.length=="1")
			   				{	
			   					img1="n0"+ybObj.img1;
								if(ybObj.img2=="99")
								{
									img2="d0"+ybObj.img1;
								}
								else
								{
									if(ybObj.img2.length=="1")
									{
										img2="d0"+ybObj.img2;
									}
									else
									{
										img2="d"+ybObj.img2;
									}
								}
			   				}
			   				else
			   				{
			   				    img1="n"+ybObj.img1;
								if(ybObj.img2=="99")
								{
									img2="d"+ybObj.img1;
								}
								else
								{
									if(ybObj.img2.length=="1")
									{
										img2="d0"+ybObj.img2;
									}
									else
									{
										img2="d"+ybObj.img2;
									}
								}
			   				}	
			   			}
			   			else
			   			{
			   				if(ybObj.img1.length=="1")
			   				{	
			   					img1="d0"+ybObj.img1;
								if(ybObj.img2=="99")
								{
									img2="n0"+ybObj.img1;
								}
								else
								{
									if(ybObj.img2.length=="1")
									{
										img2="n0"+ybObj.img2;
									}
									else
									{
										img2="n"+ybObj.img2;
									}
								}
			   				}
			   				else
			   				{
			   				    img1="d"+ybObj.img1;
								if(ybObj.img2=="99")
								{
									img2="n"+ybObj.img1;
								}
								else
								{
									if(ybObj.img2.length=="1")
									{
										img2="n0"+ybObj.img2;
									}
									else
									{
										img2="n"+ybObj.img2;
									}
								}
			   				}	
			   			}
			   			
			   			var date_y=ybObj.date_y.substr(7,3);
			   			var img_title1=ybObj.img_title1;
			   			var img_title2=ybObj.img_title2;
			   			var temp1=ybObj.temp1;
			   			var city=ybObj.city;
			   			
			   	       var ybHtml="<ul class='line'>";
			   	       ybHtml +="<li class='wei'><span>"+date_y+fchh+"时发布</span>"+city+"天气预报</li>";
			   	       ybHtml +="<li><span><img src='http://www.weather.com.cn/m/i/icon_weather/42x30/"+img1+".gif' alt='"+img_title1+"'/></span>"+weather1+"</li>";
			   	       ybHtml +="<li><span><img src='http://www.weather.com.cn/m/i/icon_weather/42x30/"+img2+".gif' alt='"+img_title2+"'/></span>"+temp1+"</li>";
			   	       ybHtml +="<li>"+wind1+"</li>";
			   	       ybHtml +="</ul><p><span><a href='http://www.weather.com.cn/weather/"+cityid+".shtml' target='_blank'>查看详情>></a></span></p>";
					  	/*2、按照雷达数据释义进行数据分类和服务提示用语调用：
						  	等级	雷达数据	服务提示用语	
						  	0-25dBz	  有强度较弱的雨雪回波，注意交通安全。
						  	26-45dBz  有中等强度的雨雪天气出现，道路湿滑，注意行车安全。
						  	大于45dBz 有较强的雨雪天气出现，减少外出，注意行车安全。
						  	数据说明：-64：无数据，-32：无回波；
					  	*/
					  	// 雷达

					  	var ladar ;
					  	try {
					  	   ladar = parseInt(radarObj.ladar);
					  	}catch(e) {
					  		ladar = -64;
					  	}
					  	var radarHtml = "<ul class='line'><li class='wei'>雷达回波</li><li>";
					  	if(ladar >= 0 && ladar <= 25) {
					  		radarHtml += "有强度较弱的雨雪回波，注意交通安全"
					  	} else if(ladar >= 26 && ladar < 45){
					  		radarHtml += "有中等强度的雨雪天气出现，道路湿滑，注意行车安全"
					  	}  else if(ladar > 45){
					  		radarHtml += "有较强的雨雪天气出现，减少外出，注意行车安全"
					  	} else if(ladar == -64) {
					  		radarHtml += "无数据"
					  	} else {
					  		radarHtml += "无回波"
					  	}
					  	radarHtml +="</li></ul></div>";
					  	
					    var result =skHtml+ybHtml + radarHtml;
				        popup = new OpenLayers.Popup.FramedCloud("featurePopup",
				    		  roadLonLat,
			                  new OpenLayers.Size(350, 350),
			                  result,
			                  null, true);
				        popup.setBackgroundColor("#B4CA63");
				        nationRoadMarkers.map.addPopup(popup);
													
				       }, "json");
	    OpenLayers.Event.stop(evt);
    });
    nationRoadMarkers.addMarker(marker);
    map.addLayer(nationRoadMarkers);


    
}

function showRardar() {
	map.addLayer(radarWms);
}


