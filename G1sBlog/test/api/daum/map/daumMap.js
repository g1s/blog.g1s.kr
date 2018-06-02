/**
 * 
 */

if(!navigator.maps){
	function debug(obj){
		console.log(obj);return;
		if(typeof obj == "object") obj = JSON.stringify(obj);
		alert(obj);
	}
	var gValue = {};
	gValue.api = {};
	gValue.api.url = "http://apis.daum.net/maps/maps3.js";
	gValue.api.key = "71c43f948620a8296041777ac6d846f1";
	gValue.api.dParam = "autoload=false&apikey=";
	gValue.api.libs = ["clusterer"];
	gValue.api.isLoad = false;
	gValue.api.loaded = [];
	gValue.marker = {};
	gValue.marker.imgUrl = {
		red : "http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
		blog : 'http://localimg.daum-img.net/localimages/07/2009/map/icon/blog_icon01_on.png'
	}
	gValue.marker.width = 30;
	gValue.marker.height = 30;
	gValue.cluster = {};
	gValue.cluster.minLevel = 6;
	gValue.cluster.calculator  = [5, 10, 20, 30];
	
	$.ajax({
		url : gValue.api.url + "?" + gValue.api.dParam + gValue.api.key + "&libraries=" + gValue.api.libs.toString(),
		dataType : "script", 
		contentType: "application/javascript"
	}).done(function(ret){
		daum.maps.load(function() {
			$.each(gValue.api.loaded, function(i, fnc){
				if(typeof fnc == "function") fnc();
			});
			gValue.api.isLoad = true;
		});
	});

	var LatLng = function(lat, lng){
		this.lat = lat, this.lng = lng;
	}

	var Bounds = function(south, west, north, east){
		this.south = south, this.west = west, this.north = north, this.east = east;
	}

	var Marker = function(opts, id, map){
		this.id = id;
		this.opts = opts||{};
		this.map = map;
		var $this = this;
		afterAPILoad(function(){
			var markerOpt = {};
			if($this.map) markerOpt.map = $this.map.self;
			if($this.opts.lat && $this.opts.lng) markerOpt.position = new daum.maps.LatLng($this.opts.lat, $this.opts.lng);
			if($this.opts.image){
				if(typeof $this.opts.image != "object"){
					var url = (typeof $this.opts.image == "string")?$this.opts.image:"";
					$this.opts.image = {};
					$this.opts.image.url = url;
				}
				
				var imgUrl = $this.opts.image.url||gValue.marker.imgUrl.red;
				var imgWidth = $this.opts.image.width||gValue.marker.width;
				var imgHeight = $this.opts.image.height||gValue.marker.height;
				var imgOpt = {};
				if($this.opts.image.offsetX && $this.opts.image.offsetY){
					imgOpt.offset = new daum.maps.Point($this.opts.image.offsetX, $this.opts.image.offsetY);
				}
				markerOpt.image = new daum.maps.MarkerImage(imgUrl, new daum.maps.Size(imgWidth, imgHeight), imgOpt);
			}
			
			$this.self = new daum.maps.Marker(markerOpt);
			$this.self.id = $this.id;
			if($this.data) $this.self.data = $this.data;
		});
	}
	
	var MarkerClusterer = function(markers, opts, onClick, id, map){
		this.id = id;
		this.markers = markers;
		this.opts = opts||{};
		this.onClick = onClick;
		this.map = map;
		var $this = this;
		afterAPILoad(function(){
			var clusterOpt = {};
			clusterOpt.map = $this.map.self;
			clusterOpt.markers = [];
			clusterOpt.averageCenter = true;
			clusterOpt.minLevel = $this.opts.minLevel||gValue.cluster.minLevel;
			clusterOpt.calculator = $this.opts.calculator||gValue.cluster.calculator;
			
			if(Array.isArray($this.markers)){
				$.each($this.markers, function(i, v){
					if(typeof v == "object" && v instanceof Marker){
						clusterOpt.markers.push(v.self);
					}
				});
			}
			
			if(typeof $this.onClick=='function'){
				clusterOpt.disableClickZoom = true;
				clusterOpt.clickable = true;
			}

			$this.self = new daum.maps.MarkerClusterer(clusterOpt);
			$this.self.id = $this.id;
			if(typeof $this.onClick=='function'){
				daum.maps.event.addListener( $this.self, 'clusterclick', function( cluster ) {
				    var markers = cluster.getMarkers();
				    var center = api2kb(cluster.getCenter());
				    var dataArr = [];
				    var idArr = [];
				    $.each(markers, function(i, v){
				    	idArr.push(v.id);
				    	dataArr.push(v.data);
				    });
				    if(typeof onClick == "function") onClick(idArr, dataArr, center);
				});
			}
		});
	}
	
	var InfoWindow = function(content, opts, onClick, id, map){
		this.id = id;
		this.content = content;
		this.opts = opts || {};
		this.onClick = onClick;
		this.map = map;
		var $this = this;
		afterAPILoad(function(){
			var infoOpt = {};
			var infoContents = [];
			if(!Array.isArray($this.content)){
				$this.content = [$this.content];
			}
			
			var id = "mapInfo"+new Date().getTime();
			var html = '<div id="'+id+'"><ul>'
			$.each($this.content, function(i, v){
				infoContents.push(v);
				if(typeof v != "object"){
					html += '<li>'+v+'</li>';
				} else {
					html += '<li>'+v.label+'</li>';
				}
			});
			html += '</ul></div>';
			infoOpt.content = html;
			infoOpt.map = $this.map.self;
			infoOpt.clickable = true;
			infoOpt.removable = true;
			if($this.opts instanceof Marker){
				infoOpt.position = $this.opts.self.getPosition();
				$this.self = new daum.maps.InfoWindow(infoOpt);
				$this.self.open(infoOpt.map, $this.opts.self);
			} else {
				if($this.opts.lat && $this.opts.lng) {
					infoOpt.position = new daum.maps.LatLng($this.opts.lat, $this.opts.lng);
				}
				$this.self = new daum.maps.InfoWindow(infoOpt);
				$this.self.open(infoOpt.map);
			}
			$this.self.id = $this.id;
			
			$("#"+id+" ul li").off("click").on("click", function(){
				if(typeof $this.onClick == "function"){
					var i = $("#"+id+" ul li").index(this);
					onClick(i, infoContents[i]);
				}
			});
		});
	}
	
	var Map = function(elem, lat, lng, level){
		this.elem = elem;
		this.lat = lat||33.450701;
		this.lng = lng||126.570667;
		this.level = level||4;
		var $this = this;
		afterAPILoad(function(){
			var mapElem = $(elem + ">.map")[0];
			var mapOpt = {};
			mapOpt.center = new daum.maps.LatLng($this.lat, $this.lng);
			mapOpt.level = $this.level;
			$this.self = new daum.maps.Map(mapElem, mapOpt);
		});
	}
	
	var Maps = function(){};
	Maps.prototype.Map = function(elem, lat, lng, level){
		$(elem).html('<div class="map"></div>');
		var mValue = {};
		mValue.seed = 0;
		mValue.map = new Map(elem, lat, lng, level);
		mValue.draws = [];
		
		this.setCenter = function(lat, lng){
			mValue.map.lat = lat;
			mValue.map.lng = lng;
			if(mValue.map.self){
				mValue.map.self.setCenter(new google.maps.LatLng(lat, lng));
			} 
		}

		this.getCenter = function(){
			var latlng;
			if(mValue.map.self){
				latlng = api2kb(mValue.map.self.getCenter());
			} else {
				latlng = new LatLng(mValue.map.lat, mValue.map.lng);
			}
			mValue.map.lat = latlng.lat;
			mValue.map.lng = latlng.lng;
			return latlng;
		}
		
		this.getBounds = function(){
			if(mValue.map.self) return api2kb(mValue.map.self.getBounds());
			else return new Bounds();
		}
		
		this.marker = function(opt){
			var id = "marker"+(mValue.seed++);
			mValue.draws[id] = new Marker(opt, id, mValue.map);
			return id;
		}
		
		this.getPosition = function(id){
			var marker = mValue.draws[id];
			if(!marker) return;
			else if(marker instanceof Marker){
				var latlng;
				if(marker.self){
					latlng = api2kb(marker.self.getPosition());
				} else {
					latlng = new LatLng(marker.opts.lat, marker.opts.lng);
				}
				marker.opts.lat = latlng.lat;
				marker.opts.lng = latlng.lng;
				return latlng;
			}
		}
		
		this.setMarker = function(id, lat, lng, data){
			var marker = mValue.draws[id];
			if(!marker) return;
			else if(marker instanceof Marker){
				marker.opts.lat = lat;
				marker.opts.lng = lng;
				marker.data = data;
				marker.map = mValue.map;
				if(marker.self){
					marker.self.setPosition(new daum.maps.LatLng(lat, lng));
					marker.self.setMap(mValue.map.self);
					marker.self.data = data;
				}
			}
		}
		
		this.infoWindow = function(content, position, onClick){
			var id = "info"+(mValue.seed++);
			if(typeof position == "string" && mValue.draws[position]) position = mValue.draws[position];
			mValue.draws[id] = new InfoWindow(content, position, onClick, id, mValue.map);
			return id;
		}
		
		this.clusterer = function(markers, opts, onClick){
			var id = "clusterer"+(mValue.seed++);
			var markArr = [];
			$.each(markers, function(i, v){
				var item = mValue.draws[v];
				if(item && item instanceof Marker){
					markArr.push(item);
				}
			})
			mValue.draws[id] = new MarkerClusterer(markArr, opts, onClick, id, mValue.map);
			return id;
		}
		
		this.clear = function(id, isRemove){
			if(!id || id === this){
				this.clear(Object.keys(mValue.draws), isRemove);
			} else if(Array.isArray(id)){
				for(var i in id){
					this.clear(id[i], isRemove);
				}
			} else {
				var draw = mValue.draws[id];
				if(!draw) return;
				if(draw instanceof InfoWindow || draw instanceof Marker){
					draw.map = null;
					if(draw.self){
						draw.self.setMap(null);
					}
				} else if(draw instanceof MarkerClusterer){
					if(draw.self){
						if(isRemove){
							draw.self.clear();
						} else {
							draw.self.redraw();
						}
					}
				}
				if(isRemove) delete mValue.draws[id];
			}
		}
		
		this.addListener = function(id, e, fnc){
			var obj;
			if(!id || id === this){
				obj = mValue.map;
				id = this;
			} else if(Array.isArray(id)){
				for(var i in id){
					this.addListener(id[i], e, fnc);
				}
			} else {
				obj = mValue.draws[id];
			}
			if(!obj) return;
			if(!obj.event) obj.event = {};
			obj.event[e] = fnc;
			afterAPILoad(function(){
				obj.self.addListener(e, function(){
					if(typeof fnc == "function"){
						fnc(id, obj.self.data);
					}
				});
			});
		}
		
		this.search = function(str, callback, opts){
			console.log("search : "+str + ", " + JSON.stringify(opts));
			if(!mValue.searcher) {
				search(str, callback, opts);
			} else {
				mValue.searcher.search(str, callback, opts);
			}
		}
		
		this.searchRTime = function(opts, onSearch, onClick){
			mValue.searcher = new SearchRandom(this, opts, onSearch, onClick);
			mValue.searcher.search("", onSearch, this.getCenter());
		}
		
		this.dist = function(pos1, pos2){
			if(typeof pos1 == "string" && mValue.draws[pos1]){
				pos1 = this.getPosition(pos1);
			}
			
			if(typeof pos2 == "string" && mValue.draws[pos2]){
				pos1 = this.getPosition(pos2);
			}
			
			if(pos1 instanceof LatLng && pos2 instanceof LatLng){
				function deg2rad(deg) {
			        return deg * (Math.PI/180)
			    }
				var lat1 = pos1.lat, lng1 = pos1.lng, lat2 = pos2.lat, lng2 = pos2.lng;
				var R = 6371; // Radius of the earth in km
			    var dLat = deg2rad(lat2-lat1);  // deg2rad below
			    var dLon = deg2rad(lng2-lng1);
			    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
			    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			    var d = R * c; // Distance in km
			    return d;
			} else {
				return -1;
			}
		}
	}
	
	function search(str, callback, opts){
		console.log("search : "+str + ", " + opts);
		if(typeof callback == "function") callback([]);
	}
	
	var SearchRandom = function(map, opts, onSearch, onClick){
		var markers = [];
		var info;
		var opt = opts||{};
		var clusterer;
		
		for(var i=0; i<40; i++){
			markers[i] = map.marker();
			map.addListener(markers[i], 'click', function(id, data){
				console.log("click marker : "+id + ", " + data);
				
				if(info) map.clear(info, true);
				info = map.infoWindow({label:id, data:data}, id, function(idx, data){
					console.log("click infoWindow : "+idx + ", " + data);
					if(typeof onClick == "function") onClick(data);
				});
			});
		}
		
		if(opt.clusterer){
			clusterer = map.clusterer(markers, {}, function(idArr, dataArr, center){
				console.log("click clusterer : "+dataArr);
				var arr = [];
				$.each(dataArr, function(i, data){
					arr.push({label : "test"+i, data: data });
				})
				
				var dist = 99999;
				var minId = "";
				var center2 = new LatLng(center.lat-1, center.lng);
				$.each(idArr, function(i, id){
					var pos = map.getPosition(id);
					var d = map.dist(center2, pos);
					if(d < dist){
						dist = d;
						minId = id;
					}
				});
				
				if(info) map.clear(info, true);
				//info = map.infoWindow(arr, map.getPosition(idArr[0]), function(idx, data){
				info = map.infoWindow(arr, minId, function(idx, data){
					console.log("click infoWindow : "+idx + ", " + data);
					if(typeof onClick == "function") onClick(data);
				});
			});
		}
		
		map.addListener(map, "dragend", function(id, data){
			console.log("dragend : "+id + ", " + data);
			map.clear(map, false);
			map.search("", onSearch);
		});
		
		this.search = function(str, callback, opts){
			var area = 0.03;
			var rets = [];
			var searchOpt = opts||{};
			if(!searchOpt.lat || !searchOpt.lng){
				var center = map.getCenter();
				searchOpt.lat = center.lat;
				searchOpt.lng = center.lng;
			}
			
			for(var i=0; i<40; i++){
				var item = {};
				item.lat = searchOpt.lat + (Math.random() * area) - area/2;
				item.lng = searchOpt.lng + (Math.random() * area) - area/2;
				map.setMarker(markers[i], item.lat, item.lng, item);
				rets.push(item);
			}

			if(clusterer) map.clear(clusterer, false);
			if(typeof callback == "function") callback(rets);
		}
	}
	
	function afterAPILoad(func){
		if(gValue.api.isLoad){
			func();
		} else {
			gValue.api.loaded.push(func);
		}
	}
	
	function api2kb(obj){
		if(typeof obj != "object") return debug("잘못 된 객체입니다.");
		if(!gValue.api.isLoad) return debug("지도가 로드되지 못했습니다.");

		if(obj instanceof daum.maps.LatLng){
			return new LatLng(obj.getLat(), obj.getLng());
		} else if(obj instanceof daum.maps.LatLngBounds){
			var sw = obj.getSouthWest();
			var ne = obj.getNorthEast();
			return new Bounds(sw.getLat(), sw.getLng(), ne.getLat(), ne.getLng());
		}
	}
	function kb2api(obj){
		if(typeof obj != "object") return debug("잘못 된 객체입니다.");
		if(!gValue.api.isLoad) return debug("지도가 로드되지 못했습니다.");
		
		if(obj instanceof LatLng){
			return new daum.maps.LatLng(obj.lat, obj.lng);
		} else if(obj instanceof Bounds){
			var sw = new daum.maps.LatLng(obj.south, obj.west);
			var ne = new daum.maps.LatLng(obj.north, obj.east);
			return new daum.maps.LatLngBounds(sw, ne);
		}
	}
	
	navigator.maps = new Maps();
}

