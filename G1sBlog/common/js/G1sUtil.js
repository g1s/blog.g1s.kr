/** 필요 라이브러리 : 
 * jQuery.js
 **/
var g$;
var G1sUtil = new function() {
  var o = {};
  o.version = '1.0.4.1';
  o.value = function(v,d){ return o.isEmpty(v)?d:v; }
  o.isEmpty = function(s) {
    return s == undefined 
      || s == null 
      || (typeof s == 'string' && s == '');
  }
  o.isNumber = function(s) {
    return typeof s == 'number' 
      || /^[0-9.]+$/.test(s)
      || /^[+-][0-9.]+$/.test(s);
  }
  o.a2z = function(s) {
    return /^[a-z]+$/.test(s);
  }
  o.A2Z = function(s) {
    return /^[A-Z]+$/.test(s);
  }
  o.a2Z = function(s) {
    return /^[a-zA-Z]+$/.test(s);
  }
  o.indexOfUpper = function(s) {
    return /[A-Z]/.exec(s)
  }
  o.indexOfLower = function(s) {
    return /[a-z]/.exec(s)
  }
  o.indexOfAlphabet = function(s) {
    return /[a-zA-Z]/.exec(s)
  }
  o.split = function(s, c, d) {
    var r = s.split(c);
    var t = s;

    if (o.isEmpty(d) || d == 0) {
    } else if (d < 0) {
      for (var i = 0; i < r.length - 1; i++) {
        t = t.substring(r[i].length);
        var ti = t.indexOf(r[i + 1]);
        r[i] = r[i] + ((ti > 0) ? t.substring(0, ti) : t);
        t = t.substring(ti);
      }
    } else {
      for (var i = 1; i < r.length; i++) {
        t = t.substring(r[i - 1].length);
        var ti = t.indexOf(r[i]);
        r[i] = ((ti > 0) ? t.substring(0, ti) : t) + r[i];
      }
    }
    return r;
  }
  o.ellipsis = function(t, l) {
    return (t.length > l) ? (t.substring(0, l) + '...') : t;
  }
  o.btnShow = function(b, d, fs, fh, o){
    fs = typeof fs == 'function'?fs:function(){};
    fh = typeof fh == 'function'?fh:function(){};
    d.css('display')=='none'?fh():fs();
    b.click(function(){
      d.css('display')=='none'?o.isEmpty(o)?(d.show(), fs()):d.show(o,fs)
        :o.isEmpty(o)?(d.hide(), fh()):d.hide(o, fh);
    });
  }
  o.script = function(u, f){
    $.ajax({
      type: "GET",
      url: u,
      dataType: "script",
      success : f
    });
  }
  o.getParam = function(u){
    u = o.isEmpty(u)?location.href:u;
    var p = u.indexOf('?')<0?'':u.substr(u.indexOf('?')+1);
    var p1 = p.split('&');
    var pp = {};
    for(var i=0; i<p1.length; i++){
      var p2 = p1[i].split('=');
      if(p2.length > 1){
        pp[p2[0]] = decodeURIComponent(p2[1]);
      }
    }
    return pp;
  }
  o.addParam = function(u, p){
      var pp = '';
      if(typeof p == 'object'){
        for(var pk in p){
          if(!o.isEmpty(p[pk])){
            pp += pk + '=' + p[pk] + '&';
          }
        }
      } else {
        pp = p;
      }
      return u + (o.isEmpty(pp)?'':(u.indexOf('?')>0?'&':'?'+pp));
    
  }



  var pfix = 'g1s';
  function gdata1(k, p) {
    var r = 'data-' + pfix;
    if (!o.isEmpty(k)) {
      var t = o.split(k.substring(0, 1).toLowerCase()
          + k.substring(1), /[A-Z]/, 1);
      for ( var i in t) {
        r += '-' + t[i].toLowerCase();
      }
    }
    if (!o.isEmpty(p)) {
      r += '="' + p + '"'
    }
    return r;
  }

  function gdata2(k) {
    var r = pfix;
    if (!o.isEmpty(k)) {
      var t = o.split(k, '-');
      for (var i = 0; i < t.length; i++) {
        r += t[i].substring(0, 1).toUpperCase() + t[i].substring(1)
      }
    }
    return r;
  }

  function _gDataValue($this, $data, index, d) {
    var dd = $this.data(d);
    if (!o.isEmpty(index)) {
      for ( var i in index) {
        dd = dd.replace(new RegExp('\\[\\$' + i + '\\]', 'gi'), '['
            + index[i] + ']');
      }
      $this.data(d, dd)
      dd = 'var $index=[' + index + '];' + dd;
    }

    return eval(dd);
  }

  function _push(j$, $data, $id, index) {
    for (var i = 0; i < j$.length; i++) {
      var $this = j$.eq(i);
      var data = $this.data();

      if (data[gdata2('id')] == $id)
        continue;
      $this.data(gdata2('id'), $id)

      if (!o.isEmpty(data[gdata2('if')])) {
        var v = _gDataValue($this, $data, index, gdata2('if'))
        if (o.isEmpty(v) || v == false || v == 0) {
          $this.find('[' + gdata1() + ']').data(gdata2('id'), $id);
          $this.hide();
          return;
        } else {
          $this.show();
        }
      }

      for ( var d in data) {
        if (d.startsWith(pfix) 
            && o.A2Z(d.substr(3, 1))
            && d != gdata2('id') 
            && d != gdata2('class')
            && d != gdata2('if') 
            && !d.startsWith(gdata2('data'))) {

          _pushData($this, $data, $id, index, d);
        }
      }
    }
  }

  function _pushData($this, $data, $id, index, d) {
    var v = '';
    try{ v = _gDataValue($this, $data, index, d) } catch(e) { console.log(e); return; }
    
    if (!v) return;
    if (d == gdata2('text')) {
      $this.text(v);
    } else if (d == gdata2('html')) {
      $this.html(v);
    } else if (d == gdata2('each')) {
      var item = $this.find('[' + gdata1('eachItem', 'item') + ']');
      if (item.length == 0) {
        item = $('<div ' + gdata1('eachItem', 'item')
            + ' style="display:none;"/>');
        item.append($this.children());
      } else {
        item = item.eq(0);
      }

      $this.children().remove();
      $this.append(item);

      for (var i = 0; i < v.length; i++) {
        var each = item.children().clone();
        $this.append(each);

        var ii = (o.isEmpty(index)) ? [] : index.slice();
        ii.push(i);
        _push(each, $data, $id, ii);
        each.removeAttr(gdata1());
        _push(each.find('[' + gdata1() + ']'), $data, $id, ii);
        each.find('[' + gdata1() + ']').removeAttr(gdata1());
      }

      item.find('[' + gdata1() + ']').data(gdata2('id'), $id);
    } else if (d == gdata2('eachItem')) {
    } else {
      $this.attr(d.substr(3), v);
    }
  }

  g$ = function(s) {
    s = s.split('[=]').join('[' + gdata1() + ']');
    var ss = s.split('[=');
    var r = ss[0];
    for (var i = 1; i < ss.length; i++) {
      var ii = ss[i].indexOf(']');
      r += '[' + gdata1('', ss[i].substring(0, ii)) + ss[i].substring(ii);
    }
    return $(r);
  }

  $.fn.extend({
    push : function($data) {
      var id = new Date();
      _push(this, $data, id);
      _push(this.find('[' + gdata1() + ']'), $data, id);
    }
  });

  return o;
};

/* date format */
if(! Date.prototype.format ){
  String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
  String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
  Number.prototype.zf = function(len){return this.toString().zf(len);};
  Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
 
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
     
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
      switch ($1) {
        case "yyyy": return d.getFullYear();
        case "yy": return (d.getFullYear() % 1000).zf(2);
        case "MM": return (d.getMonth() + 1).zf(2);
        case "dd": return d.getDate().zf(2);
        case "E": return weekName[d.getDay()];
        case "HH": return d.getHours().zf(2);
        case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
        case "mm": return d.getMinutes().zf(2);
        case "ss": return d.getSeconds().zf(2);
        case "a/p": return d.getHours() < 12 ? "오전" : "오후";
        default: return $1;
      }
    });
  };
}
if(! String.prototype.startsWith ){
  String.prototype.startsWith = function(str){
    if (this.length < str.length) { return false; }
    return this.indexOf(str) == 0;
  }
}
if(! String.prototype.endsWith ){
  String.prototype.endsWith = function(str){
    if (this.length < str.length) { return false; }
    return this.lastIndexOf(str) + str.length == this.length;
  }
}