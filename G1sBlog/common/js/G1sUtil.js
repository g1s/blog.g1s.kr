/** G1sUtil.js * */
var g$;
var G1sUtil = new function() {
  var o = {};
  o.version = '1.0.1.0';
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
      d.css('display')=='none'?G1sUtil.isEmpty(o)?(d.show(), fs()):d.show(o,fs):G1sUtil.isEmpty(o)?(d.hide(), fh()):d.hide(o, fh);
    });
  }

  var pfix = 'g1s';
  function gdata1(k, p) {
    var r = 'data-' + pfix;
    if (!G1sUtil.isEmpty(k)) {
      var t = G1sUtil.split(k.substring(0, 1).toLowerCase()
          + k.substring(1), /[A-Z]/, 1);
      for ( var i in t) {
        r += '-' + t[i].toLowerCase();
      }
    }
    if (!G1sUtil.isEmpty(p)) {
      r += '="' + p + '"'
    }
    return r;
  }

  function gdata2(k) {
    var r = pfix;
    if (!G1sUtil.isEmpty(k)) {
      var t = G1sUtil.split(k, '-');
      for (var i = 0; i < t.length; i++) {
        r += t[i].substring(0, 1).toUpperCase() + t[i].substring(1)
      }
    }
    return r;
  }

  function _gDataValue($this, $data, index, d) {
    var dd = $this.data(d);
    if (!G1sUtil.isEmpty(index)) {
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

      if (!G1sUtil.isEmpty(data[gdata2('if')])) {
        var v = _gDataValue($this, $data, index, gdata2('if'))
        if (G1sUtil.isEmpty(v) || v == false || v == 0) {
          $this.find('[' + gdata1() + ']').data(gdata2('id'), $id);
          $this.hide();
          return;
        } else {
          $this.show();
        }
      }

      for ( var d in data) {
        if (d.startsWith(pfix) 
            && G1sUtil.A2Z(d.substr(3, 1))
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
    var v = _gDataValue($this, $data, index, d)
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

        var ii = (G1sUtil.isEmpty(index)) ? [] : index.slice();
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